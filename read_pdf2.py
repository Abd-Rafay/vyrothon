import PyPDF2
import sys

def read_pdf(file_path, output_path):
    try:
        with open(file_path, "rb") as f, open(output_path, "w", encoding="utf-8") as out_f:
            reader = PyPDF2.PdfReader(f)
            for i in range(len(reader.pages)):
                out_f.write(f"--- PAGE {i+1} ---\n")
                out_f.write(reader.pages[i].extract_text() + "\n")
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    file_path = r"d:\Documents\Project\cipherstack\FE.pdf"
    output_path = r"d:\Documents\Project\cipherstack\pdf_output.txt"
    read_pdf(file_path, output_path)
