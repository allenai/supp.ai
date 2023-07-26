from argparse import ArgumentParser
from urllib import request
from os import path

def download(archive: str, dest: str) -> None:
    full_path = path.join(dest, archive)
    request.urlretrieve(
        f"https://storage.googleapis.com/uw-supp-ai-data/{archive}",
        full_path
    )
    print(f"✨ downloaded {full_path}")


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--archive", "-a",
        help="The name of the data archive to download", required=True)
    parser.add_argument("--dest", "-d",
        help="Path to where the archive should be written.")

    args = parser.parse_args()

    download(args.archive, args.dest)
