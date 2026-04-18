import PyPDF2
import sys

def read_pdf(file_path):
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for i in range(len(reader.pages)):
                print(f"--- PAGE {i+1} ---")
                print(reader.pages[i].extract_text())
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    file_path = r"d:\Documents\Project\cipherstack\FE.pdf"
    read_pdf(file_path)
