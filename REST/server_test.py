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

def query_result_to_list(results):
    return [result[0] for result in results]

def get_all_from_table(table_name, table_col_name): 
    with db: 
        cur = db.cursor() 
        cur.execute("SELECT " + table_col_name + " FROM " + table_name)
        all_from_db = cur.fetchall()
        return query_result_to_list(all_from_db)

def get_groups(): 
    with db: 
        cur = db.cursor() 
        cur.execute("SELECT group_name FROM groups")
        groups = cur.fetchall()
        return query_result_to_list(groups)


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
        #print userid[0]
        return userid[0]

def post_create_helper(table_name, table_values_dict):

    #print table_name
    #print ",".join(table_cols)
    #print ",".join(col_values)
    #print "INSERT INTO " + str(table_name) +  " ("+ ", ".join(table_values_dict.keys()) + ")" + "VALUES (" + ", ".join(table_values_dict.values()) + ")"

    with db: 
        cur = db.cursor()
        cur.execute("INSERT INTO " + str(table_name) +  " ("+ ", ".join(table_values_dict.keys()) + ") VALUES (" + ", ".join(table_values_dict.values()) + ")")

def password_correct(table_values_dict):

    #print table_name
    #print ",".join(table_cols)
    #print ",".join(col_values)

    with db: 
        cur = db.cursor()
        #print username
        #print "SELECT user_password FROM + users WHERE user_name = " + username

        #cur.execute("SELECT user_password FROM + users WHERE user_name = " + str(username))
        cur.execute("SELECT user_password FROM users WHERE user_name = " + table_values_dict["user_name"])
        password = cur.fetchone()
        if str(password[0]) == table_values_dict["user_password"][1:-1]:
            print "User Authenticated!"
            return True
        else: 
            print "Nope"
            return False

        # TODO: Clean this the fuck up 
        # TODO: REJECT USERS WHO ENTER BS 
        # TODO: Reject users who don't exist
        # TODO: password != plaintext? 




#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
    def display_error_message(self, url_direction, error_msg):
        f = open(curdir + sep + url_direction) 
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()
        self.wfile.write(f.read())
        self.wfile.write(error_msg)
        f.close()

    #Handler for the GET requests
    def do_GET(self):
        #print self.path

        if self.path=="/getmsg":
            print "YESSS" + self.headers['Cookie']

        if self.path=="/":
            self.path="/home.html"

        if self.path.endswith("?"):
            self.path=self.path[1:-1]

        if self.path=="/see_groups.html?":
            self.path="/see_groups.html"

        if self.path=="/see_users.html?":
            self.path="/see_users.html"

        try:
            #Check the file extension required and
            #set the right mime type

            sendReply = False
            if self.path.endswith(".html"):
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
                if self.path == "see_groups.html":
                    self.wfile.write(get_all_from_table("groups", "group_name"))
                elif self.path == "see_users.html":
                    self.wfile.write(get_all_from_table("users", "user_name"))
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

        form_values_dict = {str(key): "'" + str(form.getvalue(key)) + "'" for key in form.keys()}

        if (self.path[1:] == "login"):
            if (check_if_exists("users", "user_name", form["user_name"].value)):
                if (not password_correct(form_values_dict)):
                    self.display_error_message("log_in.html", "Incorrect password")
            else:
                self.display_error_message("log_in.html", "Username does not exist")

        elif (self.path[1:] == "users"):
            if (not check_if_exists("users", "user_name", form["user_name"].value)):
                post_create_helper(self.path[1:], form_values_dict)
            else: 
                self.display_error_message("create_acct.html", "Username already in use.")
                return

        elif (self.path[1:] == "messages"): 
            form_values_dict["sender"] = "'" + self.headers['Cookie'] + "'"
            post_create_helper(self.path[1:], form_values_dict)

        elif (self.path[1:] == "groups"):
            if (not check_if_exists("groups", "group_name", form["group_name"].value)):
                user_id_value = lookup_user_id_from_user_name("'" + self.headers['Cookie'] + "'") 

                form_values_dict["user_id"] = "'" + str(user_id_value) + "'"

                post_create_helper(self.path[1:], form_values_dict)
            else:
                self.display_error_message("create_group.html", "Group name already in use.")
                return 
        else:
            post_create_helper(self.path[1:], form_values_dict)

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
    