#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer
import webbrowser

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

webbrowser.open('http://localhost:8000/public/', new=2)

print "serving at port", PORT
httpd.serve_forever()

