// connectionHandler.js

// Event handler for WhatsApp connection
function onConnect() {
    console.log('WhatsApp connected');
    // Add additional connection logic here
}

// Event handler for WhatsApp disconnection
function onDisconnect(reason) {
    console.log(`WhatsApp disconnected: ${reason}`);
    // Add additional disconnection logic here
}

// Event handler for WhatsApp credential updates
function onCredentialUpdate(newCredentials) {
    console.log('WhatsApp credentials updated');
    // Add additional credential update logic here
}

// Exporting the handlers as a module
module.exports = {
    onConnect,
    onDisconnect,
    onCredentialUpdate,
};