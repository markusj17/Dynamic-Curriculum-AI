FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install
# If you are using yarn:
# RUN yarn install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD [ "npm", "start" ]
# For production, you might use: CMD [ "npm", "start" ]