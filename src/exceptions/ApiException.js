function ApiException(message) {
    this.message = message;
    this.name = "ApiException";
    this.iobeam = true;
}

module.exports = ApiException;
