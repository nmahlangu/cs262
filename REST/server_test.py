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

def check_if_exists(tbl_name, col_name, col_value):
    with db: 
        cur = db.cursor()
        cur.execute("SELECT EXISTS( SELECT 1 FROM " + tbl_name + " WHERE " + col_name + " = '" + str(col_value) + "' )")
        answer = cur.fetchone()
        if (answer[0] == 1):
            return True 
        else:
            return False

def lookup_user_id_from_user_name(username):
    with db: 
        cur = db.cursor()
        cur.execute("SELECT user_id FROM users WHERE user_name = " + str(username))
        userid = cur.fetchone()
        print userid[0]
        return userid[0]

def post_create_helper(table_name, table_cols, col_values):

    print table_name
    print ",".join(table_cols)
    print ",".join(col_values)

    with db: 
        cur = db.cursor()
        cur.execute("INSERT INTO " + str(table_name) +  " ("+ ", ".join(table_cols) + ")" + "VALUES (" + ", ".join(col_values) + ")")

def post_lookup_user_helper(table_name, table_cols, col_values):

    print table_name
    print ",".join(table_cols)
    print ",".join(col_values)

    with db: 
        cur = db.cursor()
        cur.execute("SELECT user_password FROM " + str(table_name) +  " WHERE " + str(table_cols[1]) + " = " + str(col_values[1]))
        password = cur.fetchone()
        print password[0]
        if str(password[0]) == col_values[0][1:-1]:
            print "User Authenticated!"
        else: 
            print "Nope"

        # TODO: Clean this the fuck up 
        # TODO: REJECT USERS WHO ENTER BS 
        # TODO: Reject users who don't exist
        # TODO: password != plaintext? 




#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
    def redirect_to_create_user(self, url_direction, error_msg):
        f = open(curdir + sep + url_direction) 
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()
        self.wfile.write(f.read())
        self.wfile.write(error_msg)
        f.close()

    #Handler for the GET requests
    def do_GET(self):
        print self.path 

        if self.path=="/getmsg":
            print "YESSS" + self.headers['Cookie']

        if self.path=="/":
            self.path="/home.html"

        if self.path=="/create_acct.html?":
            self.path="/create_acct.html"

        if self.path=="/log_in.html?":
            self.path="/log_in.html"

        if self.path=="/create_group.html?":
            self.path="/create_group.html"

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
        form = cgi.FieldStorage(
            fp=self.rfile, 
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE':self.headers['Content-Type'],
        })
         
        form_keys = []
        form_values = []
        for key in form.keys(): 
             form_keys.append(str(key))
             form_values.append("'" + str(form.getvalue(key)) + "'")

        if (self.path[1:] == "login"):
            post_lookup_user_helper("users", form_keys, form_values)

        elif (self.path[1:] == "users"):
            if (not check_if_exists("users", "user_name", form["user_name"].value)):
                post_create_helper(self.path[1:], form_keys, form_values)
            else: 
                self.redirect_to_create_user("create_acct.html", "Username already in use.")
                return

        elif (self.path[1:] == "messages"): 
            form_keys.append("sender")
            form_values.append("'" + self.headers['Cookie'] + "'")
            post_create_helper(self.path[1:], form_keys, form_values)

        elif (self.path[1:] == "groups"):
            if (not check_if_exists("groups", "group_name", form["group_name"].value)):
                user_id_value = lookup_user_id_from_user_name("'" + self.headers['Cookie'] + "'") 

                form_keys.append("user_id")
                form_values.append("'" + str(user_id_value) + "'")

                post_create_helper(self.path[1:], form_keys, form_values)
            else:
                self.redirect_to_create_user("create_group.html", "Group name already in use.")
                return 
        else:
            post_create_helper(self.path[1:], form_keys, form_values)

        # print self.headers['Cookie']
        # TODO: What if the username is already in use??? 

        self.send_response(301)
        self.send_header('Location',curdir + sep + "home_page.html")
        self.end_headers()

        #print self.headers

        return        
            
            
try:
    db= MySQLdb.connect("mysql.slbooth.com", "262_team_2", "michelleserena", "cs262")

    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ' , PORT_NUMBER
    
    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()
    