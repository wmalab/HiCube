# How to Recreate Figure 1

## Add datasets to API server

All datasets used to create figure 1 can be downloaded from [shared drive folder](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).


- Gene annotation track: `gene-annotations-hg19.db`
- Maternal Hi-C track: `GSE63525_GM12878_diploid_maternal.mcool`
- Paternal Hi-C track: `GSE63525_GM12878_diploid_paternal.mcool`
- Chromosome labels: `hg19.chrom.sizes`
- 3D structure track: `GSM3271351_gm12878_05.impute3.round4.clean.g3d`
- Build version of HiCube: `HiCube.zip`

Move all the data files to folder `~/hg-data`, download and start docker container:

> `--volume ~/hg-data:/data` and `--volume ~/hg-tmp:/tmp` mount the local directories (path before `:`) to a path inside the container (path after `:`), make sure the path before `:` is an **absolute path** to the directory you store datasets, for example, if you store them at `~/Documents/hg-data`, then use `~/Documents/hg-data` before `:`

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
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/hg19.chrom.sizes --filetype chromsizes-tsv --datatype chromsizes --coordSystem hg19 --name "Chromosomes (hg19)"

# Add gene annotation file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/gene-annotations-hg19.db --filetype beddb --datatype gene-annotation --coordSystem hg19 --name "Gene Annotations (hg19)"

# Add maternal cooler file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/GSE63525_GM12878_diploid_maternal.mcool --filetype cooler --datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Maternal"

# Add paternal cooler file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/GSE63525_GM12878_diploid_paternal.mcool --filetype cooler --datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Paternal"
```

If you're using the [build version](https://drive.google.com/file/d/1Z-k3tGMK0_rlbONuqD-OUT6Wybnhq__g/view?usp=sharing) of HiCube, inside the directory where you download and unzip `HiCube.zip`, run the following command to start the app:

Use Node.js serve:

```bash
# if serve is not installed
# if on macOS may need to use sudo
npm install -g serve
# change current directory to HiCube
cd HiCube
# start app
serve -s
```

or use python3 serve:

```bash
# change current directory to HiCube
cd HiCube
# start app
python -m http.server
```

then open the printed link to HiCube.

## Add datasets to HiCube

- Add the local API server: http://localhost:8888/api/v1 (it could take a few seconds to initialize).
- Choose `hg19` from the genome assembly selection list. 
- Click `Add A New Case`
- Genome position section enter `chr11:1,402,364-2,714,572` for X axis
- Select `Rao et al. (2014) Diploid Maternal` from Hi-C dataset selection list
- Choose file `GSM3271351_gm12878_05.impute3.round4.clean.g3d` for 3D genome structure model and select category to be `maternal`, resolution to be `1000000`
- Click `Add A New Dataset`
- Select data type to be `gene-annotation`, check `top` and `left` positions
- Click `Add A New Dataset`
- Select data type to be `chromsizes`, check `top` and `left` positions
- Click `Add A New Case` (the first case has been added)
- Click `Add A Paired Case`
- Choose `Rao et al. (2014) Diploid Paternal` as paired dataset for Hi-C track
- Choose file `GSM3271351_gm12878_05.impute3.round4.clean.g3d` for 3D genome structure model and select category to be `paternal`, resolution to be `1000000`
- Click `Add A Paired Case` (the second case has been added)

## Add zoom view

- Click the third button on the sidebar
- Click `Select Zoom Region`, then press and hold down the left mouse button to select the region to zoom on the Hi-C track
- Click `Create Zoom View` 

## Configure track display options

- Click the second button on the sidebar
- Click the `Rao et al. (2014) Diploid Maternal` track, it will show its display options
- Change `Zoom limit` to `25000`, and `Transforms` to `VC`, click `Update`

## Add annotations

- 