#!/bin/bash
# Strip bitcode from all frameworks - Required for Xcode 14+ / App Store submissions

echo "Stripping bitcode from frameworks..."

find "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}" -name "*.framework" -type d 2>/dev/null | while read -r framework; do
    framework_name=$(basename "$framework" .framework)
    binary_path="$framework/$framework_name"
    
    if [ -f "$binary_path" ]; then
        if xcrun otool -l "$binary_path" 2>/dev/null | grep -q "__LLVM"; then
            echo "Stripping bitcode from: $framework_name"
            xcrun bitcode_strip "$binary_path" -r -o "$binary_path"
            if [ $? -eq 0 ]; then
                echo "✓ Stripped bitcode from: $framework_name"
            else
                echo "✗ Failed to strip bitcode from: $framework_name"
            fi
        fi
    fi
done

echo "Bitcode stripping complete"
