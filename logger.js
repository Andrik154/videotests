function log(status, message){
  let dateObj = new Date();
  let date = `[${dateObj.getUTCHours()}:${dateObj.getUTCMinutes()}:${dateObj.getUTCSeconds()}]`;
  if (status == 0){
    console.log("\x1b[1m\x1b[34m", `${date} ${message}`);
  } else if (status == 1){
    console.log("\x1b[1m\x1b[33m", `[WARN]${date} ${message}`);
  } else if (status == 2){
    console.log("\x1b[4m\x1b[31m", `[ERR]${date} ${message}`);
  } else {
    console.log(`${date} message`);
  }
}

//Exports
exports.log=log;