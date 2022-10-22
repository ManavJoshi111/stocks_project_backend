const express = require("express");
// const cors = require('cors');
const app = express();
// const router = require("./router");
const PORT = 8000;
app.use(express.json());

//Route imports
const user = require('../route/userRoute');
app.use("/api/v1",user);


// const schemaFile = require("../models/userSchema");
// app.use(cors());
// app.use(express.json({ extended: true }));
// app.use(router);
// app.use(schemaFile);

app.listen(PORT, () => {
    console.log(`Server is started on port ${PORT}`);
})