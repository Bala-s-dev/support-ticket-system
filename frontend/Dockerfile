FROM node:18-alpine

WORKDIR /app

# We will initialize the react app in the next step, 
# for now, we just keep the container ready to install
CMD ["sh", "-c", "if [ ! -d 'node_modules' ]; then npx create-react-app . && npm install axios; fi && npm start"]