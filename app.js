const express = require("express");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 3000;

const DATA_FILE_PATH = path.join(__dirname, "equipmentData.json");

app.use(express.json());

app.use(bodyParser.json());

let equipmentData = require("./equipmentData.json");

app.get("/api/equipment", (req, res) => {
  res.json(equipmentData);
});

app.post("/api/equipment", (req, res) => {
  res.json(equipmentData);
});

app.post("/api/equipment/add", (req, res) => {
  const newEquipment = req.body;
  equipmentData.push(newEquipment);

  fs.writeFileSync(
    "./equipmentData.json",
    JSON.stringify(equipmentData, null, 2)
  );

  res.json({
    message: "Equipment added successfully.",
    equipment: newEquipment,
  });
});

app.get("/equipment", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/api/formattedData", async (req, res) => {
  try {
    const rawData = await fs.readFile(DATA_FILE_PATH, "utf8");
    const data = JSON.parse(rawData);
    const acceptHeader = req.get("Accept");

    if (acceptHeader.includes("text/html")) {
      const htmlResponse = data
        .map(
          (item) =>
            `<div>ID: ${item.id}, Name: ${item.name}, Category: ${item.category}, Condition: ${item.current_condition}</div>`
        )
        .join("");
      res.send(htmlResponse);
    } else if (acceptHeader.includes("application/xml")) {
      const xmlResponse = `<data>${data
        .map(
          (item) =>
            `<item><id>${item.id}</id><name>${item.name}</name><category>${item.category}</category><condition>${item.current_condition}</condition></item>`
        )
        .join("")}</data>`;
      res.type("application/xml");
      res.send(xmlResponse);
    } else {
      res.json(rawData);
    }
  } catch (error) {
    console.error("Error reading or parsing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
