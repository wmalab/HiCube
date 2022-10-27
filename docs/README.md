# How to Recreate Figure 1

All datasets used to create figure 1 can be downloaded from [shared drive folder](https://drive.google.com/drive/folders/12_kfP9tELVEPKOw7ODgx8x2MVYUvi59T?usp=sharing).


- Gene annotation track: `gene-annotations-hg19.db`
- Maternal Hi-C track: `GSE63525_GM12878_diploid_maternal.mcool`
- Paternal Hi-C track: `GSE63525_GM12878_diploid_paternal.mcool`
- Chromosome labels: `hg19.chrom.sizes`
- 3D structure track: `GSM3271351_gm12878_05.impute3.round4.clean.g3d`
- Build version of HiCube: `HiCube.zip`

Move all the data files to folder `~/hg-data`, download and start docker container:

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
(make sure you have already installed Node.js)

```bash
# if serve is not installed
# if on macOS may need to use sudo
npm install -g serve
# start app
serve -s HiCube
```




