To use the Google Sheets API, a basic python server must be set up

This can be done by running:

    python -m http.server 8000

The site can then be accessed from the url:

    localhost:8000/main.html

The '-m' option specifies that we want to run a library module as a script

http.server is the module being run, a built in module to create a simple http server

8000 is the port from which the server is being hosted

