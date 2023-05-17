const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 6500;
const app = express();

// middleware
app.use(cors());
app.use(express.json());




app.get("/", (req, res) => {
    res.send("Funny kiddy is running")
})
app.listen(port, () => {
    console.log(`Funny kiddy is running on port: ${port}`);
})