## Now to setup a new typescript express project

```
1. npm init -y
```

```
2. npm install -D typescript
```

```
3. npx tsc --init
```

```
4. uncomment outputDir in tsconfig.json
```

```
5. run npx tsc command
```

```
6. Add the following scripts to package.json
{
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "npx tsc",
    "watch": "npx tsc -w",
    "prestart": "npm run build",
    "start": "npx nodemon dist/index.js",
    "dev": "npx concurrently --kill-others \"npm run watch\"  \"npm start\" "
}
```

```
7. npm run dev 
```