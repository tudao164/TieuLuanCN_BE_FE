import os

# Danh sách thư mục chứa các file .java
folders = [


r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\controller",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\repository",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\dto",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\service",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\security",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\util",
r"D:\TieuLuan\Do_An\BE\TieuLuanCN\rapphim\src\main\java\com\example\rapphim\rapphim\entity",
]

# File đầu ra
output_file = r"D:\TieuLuan\Do_An\FE_U\Fe_User\tmp\all_java_files.txt"

with open(output_file, "w", encoding="utf-8") as out_f:
    for folder_path in folders:  # duyệt từng folder
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                # if file.endswith(".java"):
                    file_path = os.path.join(root, file)
                    out_f.write(f"=== {file_path} ===\n\n")
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            out_f.write(f.read())
                    except Exception as e:
                        out_f.write(f"*** Lỗi khi đọc file: {e} ***\n")
                    out_f.write("\n\n" + "="*80 + "\n\n")

print(f"Đã lưu tất cả file .java vào: {output_file}")
