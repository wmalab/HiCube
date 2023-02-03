# How to Generate 3D Structure from Your Own Data
## STEP 0: Required tools

- [Conda](https://docs.conda.io/en/latest/): package and environment management
- [HiC-Pro](https://github.com/nservant/HiC-Pro): Hi-C data processing pipeline
- [PASTIS](https://github.com/hiclib/pastis): inference 3D DNA structure
- [g3dtools](https://github.com/lidaof/g3d/tree/master/g3dtools): convert varying 3D structure format to .g3d format

## STEP 1: Process Hi-C fastq files with HiC-Pro
HiC-Pro[^1] is a popular pipeline for Hi-C data processing, from raw fastq files as input, to binned contact matrices as output. HiC-Pro can be installed via `conda`, please visit their offical documentation (https://github.com/nservant/HiC-Pro) for detailed instruction on how to install and run the pipeline. The output matrix files can be found at the directory: `{OUTPUT_DIR}/hic_results/matrix/{NAME}/raw/{RESOLUTION}` with filename extension `.matrix` and `.bed` for the next step.

## STEP 2: Reconstruct 3D DNA structure with PASTIS
PASTIS[^2][^3] is a tool for inference 3D DNA structure. PASTIS can be installed via `conda` and `pip`, please visit their offical documentation (https://github.com/hiclib/pastis) for deatils on installation.

First create a conda environment to install all the dependencies:

```bash
conda create -n pastis python=3.6
conda activate pastis
conda install numpy scipy scikit-learn pandas
pip install iced
```

Then install PASTIS via `pip`:

```bash
pip install pastis
```

To run PASTIS, you will need 3 files, the `{NAME}_{RESOLUTION}.matrix` and `{NAME}_{RESOLUTION}_abs.bed` files, and a `config.ini` file to define the parameters. Put all 3 files inside a directory, and below is an example of `config.ini`:

```
[all]
output_name: structure
counts: {NAME}_{RESOLUTION}.matrix
lengths: {NAME}_{RESOLUTION}_abs.bed
verbose: 1
normalize: True
max_iter: 100
seed: 0
```

Then run one of the following commands inside the directory contains `config.ini`:

```bash
pastis-mds .
pastis-nmds .
pastis-pm1 .
pastis-pm2 .
```

Each command corresponding to a different algorithm.

The file `.structure` with a prefix for the algorithm chosen (e.g. `PM1.structure`) will be used for the next step.

## STEP 3: Postprocess PASTIS output
[g3dtools](https://github.com/lidaof/g3d/tree/master/g3dtools) is a tool that convert multiple 3D structure format into `.g3d` format that HiCube uses.

`g3dtools` can be installed via `pip` with `pip install g3dtools`. Please visit their official documentation (https://github.com/lidaof/g3d/tree/master/g3dtools) for more details.

The `.structure` file has 3 columns, each represents the x, y, z coordinates in 3D respectively.
One of the format `g3dtools` accepts is the 6 columns bed-like text file:
- chromosome
- start position
- x coordinate
- y coordinate
- z coordinate
- category (optional): haplotype or cell/sample type

To convert PASTIS `.structure` file to `.g3d` format we need to add the first 2 columns from the `.bed` file from STEP 1.

```bash
cut -f 1-2 {NAME}_{RESOLUTION}_abs.bed | paste - PM1.structure | sed -e 's/ /\t/g' > {NAME}_{RESOLUTION}.PM1.structure.bed
g3dtools load {NAME}_{RESOLUTION}.PM1.structure.bed -o {NAME}_{RESOLUTION}.PM1 -s 2,3,4,5,6,7,8,9,10
```

The generated `.g3d` file can be directly used in HiCube.


[^1]: Servant N., Varoquaux N., Lajoie BR., Viara E., Chen CJ., Vert JP., Dekker J., Heard E., Barillot E. HiC-Pro: An optimized and flexible pipeline for Hi-C processing. Genome Biology 2015, 16:259 

[^2]: N. Varoquaux, F. Ay, W. S. Noble, and J.-P. Vert. A statistical approach for inferring the 3D structure of the genome. Bioinformatics, 30(12):i26–i33, 2014.

[^3]: A. G. Cauer, G. Yardimci, J.-P. Vert, N. Varoquaux, and W. S. Noble. Inferring diploid 3D chromatin structures from Hi-C data. In 19th International Workshop on Algorithms in Bioinformatics (WABI 2019), volume 143 of Leibniz International Proceedings in Informatics (LIPIcs), pages 11:1–11:13, Dagstuhl, Germany, 2019. Schloss Dagstuhl–Leibniz-Zentrum fuer Informatik.