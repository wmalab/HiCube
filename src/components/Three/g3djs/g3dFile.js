import { unzip } from "react-zlib-js";
import { Buffer } from "buffer";
import { decode } from "@msgpack/msgpack";
import BrowserLocalFile from "./io/browserLocalFile";

const HEADER_SIZE = 64000;

class G3dFile {
  constructor(config) {
    this.config = config;
    this.meta = null;

    if (config.blob) {
      this.file = new BrowserLocalFile(config.blob);
    } else {
      throw Error("Currently only support local file");
    }
  }

  async initHeader() {
    if (this.headerReady) {
      return;
    } else {
      await this.readHeader();
      this.headerReady = true;
    }
  }

  async getMetaData() {
    await this.initHeader();
    return this.meta;
  }

  async readHeader() {
    const response = await this.file.read(0, HEADER_SIZE);

    if (!response) {
      return undefined;
    }

    const buffer = Buffer.from(response);
    const size = this.getPackSize(buffer);
    const newBuffer = buffer.buffer.slice(0, size);
    const header = decode(newBuffer);
    const magic = header.magic;
    const genome = header.genome;
    const version = header.version;
    const resolutions = header.resolutions;
    const name = header.name;
    const offsets = header.offsets;
    const categories = header.categories;

    // Meta data for the g3d file
    this.meta = {
      magic,
      genome,
      version,
      resolutions,
      name,
      offsets,
      categories,
    };
  }

  getPackSize(buffer) {
    let i = buffer.length;
    for (; i--; i >= 0) {
      if (buffer[i] !== 0x00) {
        return i + 1;
      }
    }
    return i;
  }

  /*
  g3d data has the following format:
  first level keys are categories such as maternal, paternal, shared
  second level keys are chroms such as chr1, chr2, etc.
  third level keys are: start, x, y, z
  */
  async readData(resolution, callback, haplotype = "", chrom = []) {
    await this.initHeader();
    const resdata = this.meta.offsets[resolution];
    if (!resdata) {
      return null;
    }
    const { offset, size } = resdata;
    const response = await this.file.read(offset, size);
    const buffer = Buffer.from(response);
    unzip(buffer, (error, result) => {
      if (error) {
        throw error;
      }
      let data = decode(result);
      let cats = this.meta.categories;
      if (haplotype) {
        if (!cats.includes(haplotype)) {
          return null;
        }
        cats = [haplotype];
        data = { [haplotype]: data[haplotype] };
      }
      let chroms = Object.keys(data[cats[0]]);
      if (chrom.length > 0) {
        chroms = chrom.filter((chr) => chroms.includes(chr));
        if (chroms.length < 1) {
          return null;
        }
        for (const cat of cats) {
          for (const chr of chroms) {
            data[cat] = { [chr]: data[cat][chr] };
          }
        }
      }
      callback(data);
    });
  }
}

export default G3dFile;
