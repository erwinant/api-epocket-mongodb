'use strict'
const fs = require("fs")
var fileName = "./logs/" + new Date().getFullYear().toString() + (new Date().getMonth() + 1).toString() +".log"

if (!fs.existsSync(fileName)) {
  try {
    fs.writeFile(fileName, "", { flag: "wx" }, function(err) {
      if (err) {
        console.error(err);
      } else {
        var log_file_err = fs.createWriteStream(fileName, {
          flags: "a"
        })
      }
    })
  } catch (e) {
    console.error(e)
  }
} else {
  var log_file_err = fs.createWriteStream(fileName, {
    flags: "a"
  })
}

exports.create = function (message, statusCode) {
    let error = new Error(message || "Internal server error")
    error.status = statusCode || 500
    log_file_err.write(
        new Date() +
        "\n === " +
        message +
        " === \n " +
        JSON.stringify(error) +
        "\n === End " +
        message +
        " ===" +
        "\n\n"
    );
    return error
};
