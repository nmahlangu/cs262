#!/usr/bin/python

"""
http://www.acmesystems.it/python_httpd

Modified by: cs262, team 2 
"""

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import MySQLdb
import time

global db

PORT_NUMBER = 8080

def query_result_to_list(results):
    return [result[0] for result in results]

def get_all_from_table(table_name, table_col_name): 
    with db: 
        cur = db.cursor() 
        cur.execute("SELECT " + table_col_name + " FROM " + table_name + " ORDER BY " + table_col_name)
        all_from_db = cur.fetchall()
        return query_result_to_list(all_from_db)


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
    if ("user_password" not in table_values_dict.keys()):
        print "Password field empty"
        return False

    with db: 
        cur = db.cursor()
        cur.execute("SELECT user_password FROM users WHERE user_name = " + table_values_dict["user_name"])
        password = cur.fetchone()
        if str(password[0]) == table_values_dict["user_password"][1:-1]:
            print "User Authenticated!"
            return True
        else: 
            print "Nope"
            return False

        # TODO: password != plaintext? 

def lookup_messages_for_user(username): 
    with db: 
        cur = db.cursor()
        cur.execute("SELECT * FROM messages WHERE recipient = '" + str(username) + "' AND " + "status = 0")
        messages = cur.fetchone()
        if messages: 
            cur.execute("UPDATE messages SET status = 1, time_last_sent = CURRENT_TIMESTAMP WHERE id = " + str(messages[0]))

    return messages

def evaluate_message_receipt(username):
    with db: 
        cur = db.cursor()
        cur.execute("SELECT * FROM messages WHERE recipient = '" + str(username) + "' AND " + "status = 1")
        messages = cur.fetchall() 
        if messages: 
            for message in messages: 
                cur.execute("UPDATE messages SET status = 0 WHERE (id = " + str(message[0]) + ") AND " + "(TIMESTAMPDIFF(MINUTE, " + "'" + str(message[5]) + "'" + ", CURRENT_TIMESTAMP" + ") > 0)")



def mark_message_as_seen(msg_val):
    with db: 
        cur = db.cursor()
        cur.execute("UPDATE messages SET status = 2 WHERE id = " + msg_val)

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

        print self.path
        #time.sleep(60)

        if self.path=="/getmsg":
            self.path="/home_page.html"
            # fetch user's messages from DB
            msg = lookup_messages_for_user(self.headers['Cookie'])
            evaluate_message_receipt(self.headers['Cookie'])
            if msg: 
                #print "\n\n\n\n\n MESSAGE \n\n\n\n\n"
                print "YESSS" + self.headers['Cookie']
                self.send_response(200)
                self.send_header("message_id", str(msg[0]))
                self.end_headers() 
                self.wfile.write(str(msg[1]) + ": " + str(msg[3]))
            else: 
                self.send_response(200)
                self.send_header("message_id", str(-1))
                self.end_headers() 
            return 

        if self.path.startswith("/receivedmsg"):
            msg_val = self.path[len("/receivedmsg"):]
            mark_message_as_seen(msg_val)
            self.path="/home_page.html"

            f = open('workfile', 'a+')
            f.write(msg_val)
            #f.write(type(msg_val))
            #f.write(msg_val)
            #f.write(self.headers['Cookie'])
            f.close()
            # mark as seen in DB
            print "GOT IT!" + self.headers['Cookie']
            self.send_response(200)
            return 


        if self.path=="/":
            self.path="/home.html"

        if self.path.endswith("?"):
            self.path=self.path[1:-1]

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
                #self.send_header('Message IDs sent',"SCREW YOU WALDO")
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
                    return
            else:
                self.display_error_message("log_in.html", "Username does not exist")
                return

        elif (self.path[1:] == "users"):
            if (check_if_exists("users", "user_name", form["user_name"].value)):
                self.display_error_message("create_acct.html", "Username already in use.")
                return
            if ("user_password" not in form_values_dict.keys()):
                self.display_error_message("create_acct.html", "Password field was empty.")
                return
            post_create_helper(self.path[1:], form_values_dict)

        elif (self.path[1:] == "messages"): 
            form_values_dict["sender"] = "'" + self.headers['Cookie'] + "'"
            post_create_helper(self.path[1:], form_values_dict)
            self.send_response(204)
            return

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
    