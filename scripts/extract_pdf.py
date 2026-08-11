import os
import sys
import argparse
import shutil
import subprocess
import pdfplumber
from pathlib import Path

# Force stdout to be utf-8
sys.stdout.reconfigure(encoding='utf-8')

def extract_with_pdfplumber(pdf_path: Path, out_file: Path):
    print(f"[{pdf_path.name}] Extrayendo con pdfplumber...", flush=True)
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = f"# {pdf_path.stem}\n\n"
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"## Página {i+1}\n\n"
                    text += page_text + "\n\n"
        
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"[{pdf_path.name}] ✅ pdfplumber exitoso.", flush=True)
        return True
    except Exception as e:
        print(f"[{pdf_path.name}] ❌ Error en pdfplumber: {e}", flush=True)
        return False

def extract_with_mineru(pdf_path: Path, out_file: Path):
    file_size_mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"[{pdf_path.name}] Tamaño: {file_size_mb:.2f} MB. Intentando MinerU flash-extract...", flush=True)
    
    cmd_flash = [
        "mineru-open-api", 
        "flash-extract", 
        str(pdf_path), 
        "-o", 
        str(out_file), 
        "--language", "es"
    ]
    
    result = subprocess.run(cmd_flash, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0 and out_file.exists():
        print(f"[{pdf_path.name}] ✅ flash-extract exitoso.", flush=True)
        return True
        
    print(f"[{pdf_path.name}] ⚠️ flash-extract falló. Cambiando al modo API ('extract')...", flush=True)
    
    temp_dir = out_file.parent / f"temp_{pdf_path.stem}"
    cmd_extract = [
        "mineru-open-api", 
        "extract", 
        str(pdf_path), 
        "-o", 
        str(temp_dir)
    ]
    
    result_ext = subprocess.run(cmd_extract, shell=True, capture_output=True, text=True)
    
    if result_ext.returncode != 0:
        print(f"[{pdf_path.name}] ❌ Error en modo extract: {result_ext.stderr}", flush=True)
        return False
        
    md_files = list(temp_dir.rglob("*.md"))
    if md_files:
        shutil.move(str(md_files[0]), str(out_file))
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"[{pdf_path.name}] ✅ extract (API) exitoso.", flush=True)
        return True
    else:
        print(f"[{pdf_path.name}] ❌ No se generó el archivo markdown en modo extract.", flush=True)
        return False

def process_file(pdf_path: Path, out_dir: Path, engine: str):
    md_path = out_dir / (pdf_path.stem + ".md")
    if md_path.exists():
        print(f"[{pdf_path.name}] El archivo MD ya existe. Omitiendo...", flush=True)
        return

    if engine == "mineru":
        success = extract_with_mineru(pdf_path, md_path)
        if not success:
            print(f"[{pdf_path.name}] MinerU falló. Fallback a pdfplumber...", flush=True)
            extract_with_pdfplumber(pdf_path, md_path)
    elif engine == "pdfplumber":
        extract_with_pdfplumber(pdf_path, md_path)

def main():
    parser = argparse.ArgumentParser(description="Extraer PDFs a Markdown para flujo de estudio.")
    parser.add_argument("--input", "-i", required=True, help="Ruta al PDF o directorio de PDFs")
    parser.add_argument("--outdir", "-o", required=True, help="Directorio de salida para los Markdowns")
    parser.add_argument("--engine", "-e", choices=["mineru", "pdfplumber"], default="mineru", help="Motor de extracción (default: mineru)")
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    
    if input_path.is_file() and input_path.suffix.lower() == ".pdf":
        process_file(input_path, outdir, args.engine)
    elif input_path.is_dir():
        for pdf_file in input_path.glob("*.pdf"):
            process_file(pdf_file, outdir, args.engine)
    else:
        print(f"Error: {input_path} no es un PDF válido o un directorio.", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
