# HiCube

HiCube is a web application provides interactive visualization of multiscale and multimodal Hi-C and 3D genome data. 

<!-- TODO add figure 1 here -->

## Installation

Clone the repository to local:

```
git clone https://github.com/wmalab/HiCube.git
```

In the project directory, first run `npm install` to install all the dependencies, then `npm start` to start the app.

Open [http://localhost:3000](http://localhost:3000) to use HiCube in your browser.

## Usage

### Prepare datasets

The example datasets can be downloaded at [drive](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).

#### Hi-C, 1D or 2D datasets

The 1D and 2D datasets need to be served with [HiGlass Server](https://github.com/higlass/higlass-server) for access. There are two public availalbe HiGlass API servers: http://higlass.io/api/v1 and https://higlass.4dnucleome.org/api/v1 that can be used to access vast amount of public datasets. 
To serve local datasets, the easiest way is to setup a local HiGlass API server with [Docker](https://www.docker.com/) using the [higlass-docker](https://github.com/higlass/higlass-docker) image, and the local API server can be accessed at http://localhost:8888/api/v1 for HiCube.

<!-- TODO: add docker instructions -->

#### 3D genome structure datasets

HiCube can directly read local 3D genome structure file in .g3d format. Other formats e.g. nucle3d, .3dg, PASTIS output, can be converted to .g3d format using [g3dtools](https://github.com/lidaof/g3d/tree/master/g3dtools). 

Download example from [GSM3271351](https://www.ncbi.nlm.nih.gov/geo/download/?acc=GSM3271351&format=file&file=GSM3271351%5Fgm12878%5F05%2Eimpute3%2Eround4%2Eclean%2E3dg%2Etxt%2Egz) and convert to .g3d format:

```
g3dtools 3dg GSM3271351_gm12878_05.impute3.round4.clean.3dg.txt.gz \
-o GSM3271351_gm12878_05.impute3.round4.clean \
-n GM12878 \
-g hg19 \
-s 2,3,4,5,6,7,8,9,10,25,50
```

### Visualize datasets in HiCube

Before adding datasets to HiCube, users will first need to add public or local API servers (created with Docker) URLs to the *track server manager*, and select a *genome assembly* e.g. hg19, mm10, for your datasets. Then users can start to search, filter and add public or private datasets by clicking the *Add a new case* button.

#### Add datasets to create a case

The Hi-C dataset (in cooler format) is required to select and will be shown in the center track.
Additionally, a 3D genome structure file (in .g3d format) can be uploaded, and users can select which resolution, and which parental genome or cell (if such category exists) to show.

Other types of datasets, such as gene annotation, chromosome location, bigWig, etc. can also be added, users can select the track type and which track positions (left, right, top, bottom, center) to display the datasets.

Then click *Add a new case* to show it in the app.

#### Add paired datasets to create a paired case

A second case can be added by clicking the *Add a paired case* button, and for each dataset in the existing case, users need to select its paired dataset in the second case.

#### Add zoom view

Click the third button in the sidebar, users can choose *Select zoom region* and use mouse to select the region to zoom, then click *Create zoom view* to create a zoom view for that region.

#### Add annotations

Click the third button in the sidebar, users can choose *Select annotation region* and use mouse to select either 1D (from top, left, right, bottom tracks) or 2D (from center track) region, and click *Add annotation* to show it.