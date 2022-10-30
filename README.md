# HiCube

HiCube is a web application provides interactive visualization of multiscale and multimodal Hi-C and 3D genome data. 

HiCube provides following unique features and functionality:

- Paired case synchronization
- Zoom view at higher resolution
- Add configurable annotations

![Overview](docs/img/figure-1.png)

See [docs/README.md](/docs/README.md) for how to recreate the above figure.

[Demo site](https://hicube-86906.web.app/)

## Table of contents

- [1 Installation]()
	- [1.1 From pre-built]()
		- [1.1.1 Option 1: Node.js]()
		- [1.1.2 Option 2: Python]()
	- [1.2 From source code]()
- [2 Usage]()
	- [2.1 Prepare input datasets and API server]()
		- [2.1.1 Hi-C and 1D datasets]()
		- [2.1.2 3D genome structure datasets]()
	- [2.2 Visualize datasets in HiCube]()
		- [2.2.1 Add datasets to create a case]()
		- [2.2.2 Create a paired case]()
		- [2.2.3 Navigation]()
		- [2.2.4 Add zoom view]()
		- [2.2.5 Add annotations]()

## 1 Installation

### 1.1 From pre-built

Download the [build version](https://drive.google.com/file/d/1Z-k3tGMK0_rlbONuqD-OUT6Wybnhq__g/view?usp=sharing), unzip it, then use a static site server, for example, you can choose `serve` from Node.js or `http.server` from python, to run HiCube:

#### 1.1.1 Option 1: Node.js

First install [Node.js](https://nodejs.org/en/download/) LTS version, then install `serve`: 

```bash
# install a static site server
npm install -g serve
# on macOS may need to use sudo to install globally
sudo npm install -g serve
```

Finally, start the server inside the `HiCube` directory:

```bash
# change the current directory to HiCube
cd HiCube
# start the server
serve -s
```

then go to the URL it prints out.

#### 1.1.2 Option 2: Python

If you have `python3` installed, it also provides a static site server:

```bash
# change the current directory to HiCube
cd HiCube
# start the server
python -m http.server
```

then go to http://localhost:8000

### 1.2 From source code

If you want to run HiCube from its source code, first clone the repository to your computer:

```bash
git clone https://github.com/wmalab/HiCube.git
```

Install [Node.js](https://nodejs.org/en/download/) LTS version.

In the project directory, first run `npm install` to install all the dependencies, then `npm start` to start the app.

```bash
cd HiCube
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use HiCube in your browser.

## 2 Usage
### 2.1 Prepare input datasets and API server

All example datasets can be downloaded at [shared drive folder](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).

#### 2.1.1 Hi-C and 1D datasets

The Hi-C and other 1D datasets need to be served with [HiGlass Server](https://github.com/higlass/higlass-server) for access. There are two public availalbe HiGlass API servers: http://higlass.io/api/v1 and https://higlass.4dnucleome.org/api/v1 that can be used to access vast amount of public datasets. 

To serve local datasets, the easiest way is to setup a local HiGlass API server with [Docker](https://www.docker.com/) using the [higlass-docker](https://github.com/higlass/higlass-docker) image, and the local API server can be accessed at http://localhost:8888/api/v1 for HiCube.

Create a directory (e.g. `~/hg-data`) to store the datasets, example files can be downloaded from [shared drive folder](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).

```bash
# Pull the latest image of higlass-docker
docker pull higlass/higlass-docker

# Start docker container
docker run --detach \
	--publish 8888:80 \
	--volume ~/hg-data:/data \
	--volume ~/hg-tmp:/tmp \
	--name higlass-container \
	higlass/higlass-docker

# Add chromosome size file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset \
--filename /data/hg19.chrom.sizes --filetype chromsizes-tsv \
--datatype chromsizes --coordSystem hg19 --name "Chromosomes (hg19)"

# Add gene annotation file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset \
--filename /data/gene-annotations-hg19.db --filetype beddb \
--datatype gene-annotation --coordSystem hg19 --name "Gene Annotations (hg19)"

# Add cooler files to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset \
--filename /data/GSE63525_GM12878_diploid_maternal.mcool --filetype cooler \
--datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Maternal"

docker exec higlass-container python higlass-server/manage.py ingest_tileset \
--filename /data/GSE63525_GM12878_diploid_paternal.mcool --filetype cooler \
--datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Paternal"
```

> `--volume ~/hg-data:/data` and `--volume ~/hg-tmp:/tmp` mount the local directories (path before `:`) to a path inside the container (path after `:`), make sure the path before `:` is an **absolute path** to the directory you store datasets, for example, if you store them at `~/Documents/hg-data`, then use `~/Documents/hg-data` before `:`

#### 2.1.2 3D genome structure datasets

HiCube can directly read local 3D genome structure file in .g3d format. Other formats e.g. nucle3d, .3dg, PASTIS output, can be converted to .g3d format using [g3dtools](https://github.com/lidaof/g3d/tree/master/g3dtools). 

Download example from [GSM3271351](https://www.ncbi.nlm.nih.gov/geo/download/?acc=GSM3271351&format=file&file=GSM3271351%5Fgm12878%5F05%2Eimpute3%2Eround4%2Eclean%2E3dg%2Etxt%2Egz) and convert to .g3d format:

```
g3dtools 3dg GSM3271351_gm12878_05.impute3.round4.clean.3dg.txt.gz \
-o GSM3271351_gm12878_05.impute3.round4.clean \
-n GM12878 \
-g hg19 \
-s 2,3,4,5,6,7,8,9,10,25,50
```

A processed example .g3d file can be downloaded from [shared drive folder](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).

### 2.2 Visualize datasets in HiCube

Before adding datasets to HiCube, users will first need to enter public or local API servers (created with Docker) URLs to the **Track Source Servers**, click the **+** icon on the left side to add the server.

Then select a **Genome Assembly** e.g. hg19, mm10, for your datasets. 

![Add server](docs/img/add-server.png)

Then users can start to add public or private datasets by clicking the **Add A New Case** button.

#### 2.2.1 Add datasets to create a case

First users need to enter the genome positions for display at *X axis* (required) and *Y axis* (optional), the accepting formats including: 

- a single chromosome name: chr1
- a range of chromosomes separated by -: chr1-chr22
- a range on a single chromosome: chr11:1500000-2400000
- a range span on multiple chromosomes: chr1:100000-chr2:100000

![Genome positions](docs/img/genome-position.png)

The Hi-C dataset (in cooler format) is required to select and will be shown in the center track.

Additionally, a 3D genome structure file (in .g3d format) can be uploaded, and users can select which resolution, and which parental genome or cell (if such category exists) to show.

![Hi-C and 3D](docs/img/hic-3d.png)

Other types of datasets, such as gene annotation, chromosome location, bigWig, etc. can also be added, users can select the track type and which track positions (left, right, top, bottom) to display the datasets.

![Additional datasets](docs/img/additional-datasets.png)

Then click **Add A New Case** to display the datasets in the app.

#### 2.2.2 Create a paired case

A second case can be added by clicking the **Add A Paired Case** button, and for each dataset in the existing case, users need to select its paired dataset in the second case.

![Paired case](docs/img/paired-case.png)

The following adjustments will be synchronized between cases:

- navigation i.e. the current displayed genomic region
- zoom view creation and navigation
- annotations
- display options

#### 2.2.3 Navigation

- Press and hold down the left mouse button to move around
- Use scroll wheel to zoom in or zoom out
- Enter the precise genomic positions inside the genome position bar on the top and click **Go** to move to that region

![Genome position bar](docs/img/genome-position-bar.png)

#### 2.2.4 Add zoom view

Switch to the **Tools** tab (3rd tab) in the sidebar, users can choose **Select Zoom Region**, then press and hold down the left mouse button to select the region on the center Hi-C track, or 1D tracks to zoom, then click **Create Zoom View** to create a zoom view for that region, or click **Cancel** to cancel your selection.

After a zoom view is created, click **Remove Zoom View** will remove the zoom view. Use **Select Zoom Region** and **Create Zoom View** again will replace the current zoom view a new one from selection.

![Select zoom region](docs/img/zoom-select.png)

#### 2.2.5 Add annotations

Switch to the **Tools** tab (3rd tab) in the sidebar, users can choose **Select Annotation Region**, then press and hold down the left mouse button to select either 1D (on top, left, right, bottom tracks) or 2D (on center track) region, and click **Add Annotation** to add the annotation to all views.

Other ways to add annotations are: enter in the textarea or upload a file contains a list of genomic intervals in the following formats:

For 1D annotations:

```
chrom start-coordinate chrom end-coordinate
```

For 2D annotations:

```
x-ax-chrom x-ax-start-coordinate x-ax-chrom x-ax-end-coordinate y-ax-chrom y-ax-start-coordinate y-ax-chrom y-ax-end-coordinate
```

> 1D annotation should only span within the same chromosome, not across multiple chromosomes.
> 
> The X axis or Y axis of 2D annotation should only span within the same chromosome, although the chromosomes for X and Y axes can be different.

![Add annotations](docs/img/add-annotations.png)
