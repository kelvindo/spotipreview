# Spotipreview
Listen to Spotify previews of playlists and artists. Save liked songs to your personal Spotify library. See a live demo: [Spotipreview](http://spotipreview.herokuapp.com/).

This project was bootstrapped with [mars/heroku-cra-node](https://github.com/mars/heroku-cra-node).

## Local Development

Because this app is made of two npm projects, there are two places to run `npm` commands:

1. **Node API server** at the root `./`
1. **React UI** in `react-ui/` directory.

### Run the API server

In a terminal:

```bash
# Initial setup
npm install

# Start the server
npm start
```

#### Install new npm packages for Node

```bash
npm install package-name --save
```


### Run the React UI

The React app is configured to proxy backend requests to the local Node server. (See [`"proxy"` config](react-ui/package.json))

In a separate terminal from the API server, start the UI:

```bash
# Always change directory, first
cd react-ui/

# Initial setup
npm install

# Start the server
npm start
```

#### Install new npm packages for React UI

```bash
# Always change directory, first
cd react-ui/

npm install package-name --save
```

## Deploy to Heroku

```bash
git push heroku master
```

## TODO
- Paginate search results and songs (infinite scroll)
- Show user recommended songs