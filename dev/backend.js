//
// ====== Backend for JuNe PaulaJS test purposes ======
//     https://github.com/EduardoRuizM/june-paulajs
//
// Copyright (c) 2024 Eduardo Ruiz <eruiz@dataclick.es>

const backserver = require('./backserver');

const app = backserver()
		.on('listening', address => console.log('JuNe BackServer running, waiting for requests', address))
		.on('error', err => console.error(err));

app.get('/captcha', (req, res) => {

  console.log('Received captcha request');
  req.content.k = app.captcha();
});

app.post('/sample1', (req, res) => {

  req.content = {message: 'Sent ' + req.body.field10}
  console.log('Received JSON sample1 variables', (new Date()).toISOString().substring(0, 19).replace('T', ' '), req.body);
});

app.post('/sample2', (req, res) => {

  // To check captcha
  if(!req.body.captcha || !app.captcha(req.body.captcha)) {

    req.content = {message: 'Wrong captcha'}
    console.log('Captcha failed');
    return;
  }

  // You must check here if user is logged or exit
  // if(!app.checkLogin()) return;

  req.content = {message: 'Sent ' + req.body.field20}
  console.log('Received JSON sample2 variables', (new Date()).toISOString().substring(0, 19).replace('T', ' '), req.body);
});

app.post('/files', (req, res) => {

  // You must check here if user is logged or exit
  //if(!app.checkLogin()) return;

  // Show all POST variables

  let body = {...req.body};

//  if(body.myfile) body.myfile = '(hidden here)'; // Uncomment this line to hide file content

  console.log('Received body files variables via multipart', (new Date()).toISOString().substring(0, 19).replace('T', ' '), body);

  // Show 'myfile' array variables for small files (with objects: 'name' for filename, 'type' for content-type, size, (width)x(height) if image, and 'content' for content file)
  // If binary file such as image, save it in binary `fs.writeFileSync('myname', f.content, 'binary');`
  if(req.body.myfile) {
    console.log('-- Small files:');
    for(let f of req.body.myfile)
      console.log(`File name: '${f.name}', content-type: ${f.type}, size: ${f.size}` + ((f.width && f.height) ? `, image: ${f.width}x${f.height}` : ''));
  }
});

app.put('/files', (req, res) => {

  // Show all PUT variables
  let body = {...req.body};
  if(body.myfile)
    body.myfile = '(hidden here)';

  console.log('Received PUT body variables via multipart', (new Date()).toISOString().substring(0, 19).replace('T', ' '), body);

  // Show 'myfile' for large files
  // function jPaufileUpload returns:
  //	false	= if no file
  //	true	= if still loading
  //	array_objects(name:variable_name, number:file_uploaded_number, file:file_path) = when ends
  //	So, when ends, you must move or do anything with file located in temp folder
  // You can upload several files, so number from 0 to n, and name "myfile" for first, "myfile_1" for second, "myfile_2" for third...

  // Files uploaded to OS temp folder, delete these files if exist on BackServer init, or in the next upload if modification file great than 30 minutes

  // Variables in each file upload:
  //	myfile_ID	= Upload Id (to differentiate the same upload in each file and connection / section)
  //	myfile_RND	= Unique randon number (second code to differentiate the same upload in each file)
  //	myfile_NAME	= File name
  //	myfile_TYPE	= Content-Type
  //	myfile_SIZE	= File size
  //	myfile_WIDTH	= Image width (if file is image)
  //	myfile_HEIGHT	= Image height (if file is image)
  //	myfile_PATH	= File path (webkitRelativePath: relative path to selected directory)
  //	myfile_PART	= File part
  //	myfile_PARTS	= File total parts

  let f = app.jPaufileUpload(req, 'myfile');
  if(f === false) console.error('No files in myfile');
  if(f === true) console.log('Still loading myfile');

  if(f instanceof Object) console.log(`Large file number '${f.number}' uploaded in file '${f.file}'`);
});

app.createServer();
