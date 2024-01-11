#!/usr/bin/env node

//
// =============== JuNe WebServer 2.1.0 ===============
//
// Copyright (c) 2024 Eduardo Ruiz <eruiz@dataclick.es>
// https://github.com/EduardoRuizM/june-webserver
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

const fs = require('fs');
const net = require('net');
const path = require('path');
const http = require('http');
const https = require('https');
const http2 = require('http2');
const { URL } = require('url');
const crypto = require('crypto');

class WebServer {
  constructor(options) {
    if(!options) {

      options = {};
      for(let i = 0; i < process.argv.length - 1; i++) {

	if(/^url|folder|cert|key|http2|index|if404|dev|hmr|script$/.test(process.argv[i].substring(1)) && process.argv[i + 1])
	  options[process.argv[i].substring(1)] = process.argv[i + 1];
      }
    }

    this.url = new URL(options.url ?? 'http://localhost:8180');
    this.folder = options.folder || process.cwd();
    this.cert = options.cert;
    this.key = options.key;
    this.http2 = options.http2;
    this.mime = {};
    this.index = (options.index || 'index.html index.htm').split(' ');
    this.if404 = options.if404;
    this.dev = !!options.dev;
    this.hmr = options.hmr || 30795;
    this.hmrsocket = 0;
    this.hmrtmr = 0;
    this.script = options.script;

    const mimes = 'html,htm text/html css,xml,txt text/* ics text/calendar png,gif,webp,avif image/* jpg,jpeg image/jpeg ico image/x-icon svg image/svg+xml mp3,mpg,mpeg audio/mpeg ogg,aac,opus audio/* mp4,webm video/* js,mjs text/javascript json,pdf,zip application/* ttf,woff2 font/*'.split(' ');
    for(let i = 0; i < mimes.length; i+= 2) {

      let ex = mimes[i].split(',');
      for(let e of ex)
	this.mime[e] = mimes[i + 1].replace('*', e);
    }

    this.createServer();

    if(this.dev) {

      this.watch(this.folder);
      require('child_process').exec(((/^win/.test(process.platform)) ? 'start ' : ((/^darwin/.test(process.platform)) ? 'open ' : 'xdg-open ')) + this.url.toString());

      this.hmrserver = net.createServer(socket => {
	socket.on('data', data => {
	  let d = data.toString();
	  if(d.includes('Upgrade: websocket')) {
	    const h = /Host:\s*(.*?)\r\n/i.exec(d)[1], k = /Sec-WebSocket-Key:\s*(.*?)\r\n/i.exec(d)[1];
	    socket.write(`HTTP/1.1 101 Web Socket Protocol Handshake\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nWebSocket-Origin: ${h}\r\nWebSocket-Location: ws://${h}/\r\nSec-WebSocket-Accept: ` + crypto.createHash('sha1').update(k + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64') + '\r\n\r\n');
	    this.hmrsocket = socket;
	  }
	});
      }).listen(this.hmr, () => console.log('JuNe DevServer HMR listening', this.hmrserver.address()));
    }
  }
  createServer() {
    this.cert_dt = (this.cert && fs.existsSync(this.cert) && this.url.protocol === 'https:') ? fs.statSync(this.cert).mtime : 0;
    this.server = ((this.cert_dt) ? ((this.http2) ? http2.createSecureServer : https.createServer)({cert: fs.readFileSync(this.cert), key: fs.readFileSync(this.key)}) : http.createServer())
      .on('listening', () => console.log('JuNe WebServer listening', this.server.address()))
      .on('request', (req, res) => this.request(req, res))
      .on('error', err => console.error('Error', err));
    this.server.listen((this.url.port) ? this.url.port : ((this.cert) ? 443 : 80), this.url.hostname);
  }
  watch(p) {
    fs.watch(p, (eventType, filename) => this.change());
    p = this.path(p);
    fs.readdirSync(p, {withFileTypes: true}).filter(f => f.isDirectory() && f.name !== 'node_modules').map(f => this.watch(p + f.name));
  }
  change() {
    clearTimeout(this.hmrtmr);
    this.hmrtmr = setTimeout(() => {if(this.hmrsocket) this.hmrsocket.write(this.encodeWS('1'))}, 500);
  }
  encodeWS(t) {
    let b1 = 0x80 | (0x1 & 0x0f), length = Buffer.from(t, 'utf8').length, h;
    if(length <= 125) {
      h = Buffer.alloc(2);
      h.writeUInt8(b1, 0);
      h.writeUInt8(length, 1);
    } else if(length > 125 && length < 65536) {
      h = Buffer.alloc(4);
      h.writeUInt8(b1, 0);
      h.writeUInt8(126, 1);
      h.writeUInt16BE(length, 2);
    } else if(length >= 65536) {
      h = Buffer.alloc(10);
      h.writeUInt8(b1, 0);
      h.writeUInt8(127, 1);
      h.writeUInt32BE(0, 2);
      h.writeUInt32BE(length, 6);
    }
    return Buffer.concat([h, Buffer.from(t, 'utf8')]);
  }
  path(p) {
    if(p.substring(p.length - 1) !== path.sep)
      p+= path.sep;

    return p;
  }
  async request(req, res) {
    const { method, url, headers } = req;
    let status = 404, str, f = this.folder + url, ext, fp;

    if(fs.existsSync(f)) {

      if(fs.lstatSync(f).isDirectory()) {

	f = this.path(f);
	this.index.forEach(i => {

	  if(!fp && fs.existsSync(f + i))
	    fp = f + i;
	});

      } else
	fp = f;
    }

    if(!fp && this.if404 && (!headers.accept || headers.accept.includes('text/html')) && (f = this.path(this.folder) + this.if404) && fs.existsSync(f))
      fp = f;

    if(fp) {

      status = 200;
      ext = fp.split('.').pop().toLowerCase();
      str = fs.readFileSync(fp);
      if(this.dev && ext === 'html')
	str = str.toString('binary').replace(/<\/head>/i, `<script>let _w_s;function _w_sf() {if(_w_s) {_w_s.close(); _w_s = null}_w_s = new WebSocket('ws://localhost:${this.hmr}'); _w_s.onmessage = e => {` + (this.script || 'location.reload()') + '}; _w_s.onerror = e => setTimeout(() => _w_sf(), 2000)}_w_sf()</script></head>');
    }

    res.writeHead(status, {'Content-Type': (!fp || !ext || ext === '/') ? 'text/html' : ((this.mime[ext]) ? this.mime[ext] : 'application/octet-stream')});
    res.write((status === 404) ? '<div style="text-align: center"><h1>404 Not Found</h1><hr><h3>JuNe WebServer</h3></div>' : str);
    res.end();

    if(this.cert_dt && fs.existsSync(this.cert) && this.cert_dt !== fs.statSync(this.cert).mtime) {

      this.server.close();
      this.createServer();
    };
  }
}

new WebServer();
