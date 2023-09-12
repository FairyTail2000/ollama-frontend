# Ollama client

This is a client for [ollama](https://github.com/jmorganca/ollama). It **cannot** be used without it.

This webinterface is currently only available if you have node + npm installed

In order for it to work you first need to open a command line and change the directory to the files in this repo.

After that you need to install all the dependencies. If you have a standard node environment you can install the dependencies like this:

```shell
npm install 
```
If you are a bit more experienced and want to use yarn or pnpm please substitute the commands

As soon as the installation is finished you use
```shell
npm start
```
After a short while you see something like this:

```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
```

If you have ollama and running you can click on the displayed link or type it into the browser.


Right now this client only has chat capabilities for any other operations like pulling models you have to use the command line. You can find more info in the repo of ollama

---

In case of docker the procedure is different as demonstrated now. We are still in the terminal in the folder containing this project.

First we need to build the image. This can be done with the following command:

```shell
docker build -t ollama-client .
```

In order to use the image we need to run it. This can be done with the following command:

```shell
docker run --rm --net host ollama-client
```

The --host is required to allow the container to access the host network. This is required to allow the client to connect to the ollama server.

---

It might be the best to lauch ollama with the environment variable OLLAMA_HOST set to 0.0.0.0

This will ensure that ollama communication works as expected
