#!/usr/bin/env node

//
// ============= Utilities for JuNe PaulaJS =============
// create template project  -  uglifyjs and build project
//                 https://paulajs.com
//
//  Copyright (c) 2024 Eduardo Ruiz <eruiz@dataclick.es>

const fs = require('fs');
const path = require('path');

function ask(q) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((r, rej) => readline.question(q, i => r(i)));
}

async function create() {
  let d = process.cwd().split(path.sep).pop(), name = await ask(`PaulaJS Project Name: (${d}) `), sd = `${__dirname}${path.sep}`;
  name = (name === '') ? d : name;

  let cs = [	{d: 'JuNe PaulaJS (minified)', f: '../june-paula.min.js'},
		{d: 'JuNe CSS (minified with Font Awesome)', f: 'template/june-cssfa.min.css'},
		{d: 'Template index', f: 'template/template.html', n: 'index.html', r: [{k: '%%title%%', v: name}]},
		{d: 'Favicon', f: 'template/favicon.ico'},
		{d: 'Robots', f: 'template/robots.txt'},
		{d: 'SansSerif font', f: 'template/fonts/sansserif.woff2', t: 'fonts'},
		{d: 'Font Awesome Solid', f: 'template/fonts/fa-solid-900.woff2', t: 'fonts'},
		{d: 'Font Awesome Brands', f: 'template/fonts/fa-brands-400.woff2', t: 'fonts'}
	   ];

  for(let c of cs) {
    if(!fs.existsSync(sd + c.f)) {
      console.log(`File not exists ${path.resolve(sd + c.f)}`);
      process.exit(1);
    }
  }

  for(let c of cs) {
    let n = (c.n) ? c.n : ((c.t) ? `${c.t}${path.sep}` : '') + c.f.split('/').pop(), v = fs.readFileSync(sd + c.f);
    c.t && !fs.existsSync(c.t) && fs.mkdirSync(c.t);
    console.log(`File ${n}`);
    if(c.r) {
      v = v.toString();
      c.r.forEach(e => v = v.replaceAll(e.k, e.v));
    }
    fs.writeFileSync(n, v);
  }

  console.log('\n\033[36m' + name + ' created\033[0m');
  process.exit(0);
}

function build(d, o, t) {
  fs.readdirSync(`${d}${o}`, {withFileTypes: true}).map(f => {
    if(f.isDirectory()) {
      if(`${o}${f.name}` !== `${path.sep}dist`) {
	fs.mkdirSync(`${d}${t}${f.name}`);
	build(d, `${o}${f.name}${path.sep}`, `${t}${f.name}${path.sep}`);
      }

    } else {

      if(f.name.slice(-3) === '.js' && f.name.slice(-7) !== '.min.js')
	require('child_process').exec(`uglifyjs "${d}${o}${f.name}" -c -m -o "${d}${t}${f.name}"`, {cwd: `${__dirname}${path.sep}..${path.sep}..${path.sep}..`});
      else
	fs.writeFileSync(`${d}${t}${f.name}`, fs.readFileSync(`${d}${o}${f.name}`));
    }
  });
}

console.log('===============================\nPaulaJS create or build utility\n===============================\n');

const al = process.argv.length;
switch((al) ? process.argv[al - 1] : 0) {
  case 'create':
    if(fs.readdirSync(process.cwd(), {withFileTypes: true}).filter(f => !f.isDirectory()).length)
      console.error('*** Warning directory not empty ***\n');
    create();
    break;

  case 'build':
    console.error('*** Be sure you have Uglify-JS installed with "npm install uglify-js -g" ***');
    fs.existsSync('dist') && fs.rmSync('dist', {recursive: true, force: true});
    fs.mkdirSync('dist');
    build(process.cwd(), path.sep, `${path.sep}dist${path.sep}`);
    console.log('\n\033[36mUglify-JS and dist successfully done\033[0m');
    break;

  default:
    console.error('Parameters to do in current directory:\n\n\033[36mcreate\033[0m\tto create a PaulaJS app\n\033[36mbuild\033[0m\tto uglify and create distribution dist/ directory');
    process.exit(1);
    break;
}
