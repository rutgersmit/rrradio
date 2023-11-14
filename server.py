import http.server
import socketserver

# Set the port number
port = 8001

# Define the handler to use (SimpleHTTPRequestHandler serves files from the current directory)
handler = http.server.SimpleHTTPRequestHandler

# Combine the handler with the desired port
with socketserver.TCPServer(("", port), handler) as httpd:
    print(f"Serving on port {port}")
    print(f"Open your web browser and visit http://localhost:{port}/index.html")

    # Start the server
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print(f"Server stopped on port {port}")
