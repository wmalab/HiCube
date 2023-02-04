#!/bin/bash

# Add chromosome size file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/hg19.chrom.sizes --filetype chromsizes-tsv --datatype chromsizes --coordSystem hg19 --name "Chromosomes (hg19)"

# Add gene annotation file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/gene-annotations-hg19.db --filetype beddb --datatype gene-annotation --coordSystem hg19 --name "Gene Annotations (hg19)"

# Add maternal cooler file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/GSE63525_GM12878_diploid_maternal.mcool --filetype cooler --datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Maternal"

# Add paternal cooler file to server
docker exec higlass-container python higlass-server/manage.py ingest_tileset --filename /data/GSE63525_GM12878_diploid_paternal.mcool --filetype cooler --datatype matrix --coordSystem hg19 --name "Rao et al. (2014) Diploid Paternal"
