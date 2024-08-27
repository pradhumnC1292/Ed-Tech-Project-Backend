import multer from "multer";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const id = uuid();

    const fileExtension = file.originalname.split(".").pop();

    const fileName = `${id}.${fileExtension}`;

    cb(null, fileName);
  },
});

export const uploadFiles = multer({ storage }).single("file");