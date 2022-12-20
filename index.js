const { NFC } = require("nfc-pcsc");

const nfc = new NFC(); // optionally you can pass logger

nfc.on("reader", async (reader) => {
  console.log(`${reader.reader.name}  device attached`);

  // enable when you want to auto-process ISO 14443-4 tags (standard=TAG_ISO_14443_4)
  // when an ISO 14443-4 is detected, SELECT FILE command with the AID is issued
  // the response is available as card.data in the card event
  // see examples/basic.js line 17 for more info
  // reader.aid = 'F222222222';

  reader.on("card", async (card) => {
    // card is object containing following data
    // [always] String type: TAG_ISO_14443_3 (standard nfc tags like MIFARE) or TAG_ISO_14443_4 (Android HCE and others)
    // [always] String standard: same as type
    // [only TAG_ISO_14443_3] String uid: tag uid
    // [only TAG_ISO_14443_4] Buffer data: raw data from select APDU response

    console.log(`${reader.reader.name}  card detected`, card);

    // example reading 12 bytes assuming containing text in utf8
    try {
      // reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
      const data = await reader.read(4, 12); // starts reading in block 4, continues to 5 and 6 in order to read 12 bytes
      console.log(`data read`, data);
      const payload = data.toString(); // utf8 is default encoding
      console.log(`data converted`, payload);
    } catch (err) {
      console.error(`error when reading data`, err);
    }

    //example write 12 bytes containing text in utf8
    try {
      const data = Buffer.allocUnsafe(12);
      data.fill(0);
      const text = "staff/09"; //new Date().toTimeString();
      data.write(text); // if text is longer than 12 bytes, it will be cut off
      // reader.write(blockNumber, data, blockSize = 4)
      await reader.write(4, data); // starts writing in block 4, continues to 5 and 6 in order to write 12 bytes
      console.log(`data written`);
    } catch (err) {
      console.error(`error when writing data`, err);
    }
  });

  reader.on("card.off", (card) => {
    console.log(`${reader.reader.name}  card removed`, card);
  });

  reader.on("error", (err) => {
    console.log(`${reader.reader.name}  an error occurred`, err);
  });

  reader.on("end", () => {
    console.log(`${reader.reader.name}  device removed`);
  });
});

nfc.on("error", (err) => {
  console.log("an error occurred", err);
});
