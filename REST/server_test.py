#!/usr/bin/python

"""
http://www.acmesystems.it/python_httpd

Modified by: cs262, team 2 
"""

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import MySQLdb

global db

PORT_NUMBER = 8080

#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
    
    #Handler for the GET requests
    def do_GET(self):
        print self.path 

        if self.path=="/":
            self.path="/home.html"

        if self.path=="/create_acct.html?":
            self.path="/create_acct.html"

        try:
            #Check the file extension required and
            #set the right mime type

            sendReply = False
            if self.path.endswith(".html"):
                mimetype='text/html'
                sendReply = True
            if self.path.endswith(".html?"):
                mimetype='text/html'
                sendReply = True
            if self.path.endswith(".jpg"):
                mimetype='image/jpg'
                sendReply = True
            if self.path.endswith(".gif"):
                mimetype='image/gif'
                sendReply = True
            if self.path.endswith(".js"):
                mimetype='application/javascript'
                sendReply = True
            if self.path.endswith(".css"):
                mimetype='text/css'
                sendReply = True

            if sendReply == True:
                #Open the static file requested and send it
                f = open(curdir + sep + self.path) 
                self.send_response(200)
                self.send_header('Content-type',mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            return

        except IOError:
            self.send_error(404,'File Not Found: %s' % self.path)

    #Handler for the POST requests
    def do_POST(self): 
        if self.path=="/create_user":
            form = cgi.FieldStorage(
                fp=self.rfile, 
                headers=self.headers,
                environ={'REQUEST_METHOD':'POST',
                         'CONTENT_TYPE':self.headers['Content-Type'],
            })

            # form["your_username"].value
            # form["your_password"].value

            with db: 
                cur = db.cursor()
                cur.execute("INSERT INTO users (user_name, user_password, user_online_status) VALUES (" + "'" + form["your_username"].value + "'" + ", " + "'" + form["your_password"].value + "'" +", " + "'" + str(True) + "'" + ")")

            print "Your name is: %s" % form["your_username"].value
            self.send_response(200)
            self.end_headers()
            self.wfile.write("Thanks %s !" % form["your_username"].value)
            return        
            
            
try:
    db= MySQLdb.connect("mysql.slbooth.com", "262_team_2", "michelleserena", "cs262")

    # with db: 
    #     cur = db.cursor()
    #     #cur.execute("DROP TABLE IF EXISTS Writers")
    #     #cur.execute("CREATE TABLE Writers(Id INT PRIMARY KEY AUTO_INCREMENT, \
    #     #             Name VARCHAR(25))")
    #     cur.execute("SELECT * FROM Writers")
    #     rows = cur.fetchall()

    #     for row in rows: 
    #         print row
    #     #cur.execute("INSERT INTO Writers(Name) VALUES('Honore de Balzac')")
    #     #cur.execute("INSERT INTO Writers(Name) VALUES('Lion Feuchtwanger')")
    #     #cur.execute("INSERT INTO Writers(Name) VALUES('Emile Zola')")
    #     #cur.execute("INSERT INTO Writers(Name) VALUES('Truman Capote')")

    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ' , PORT_NUMBER
    
    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()
    