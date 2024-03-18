bundler=$1
detect_format=$2
format=$3
detect_version=$4
passed_version=$5
file_format=$6

uppercase_detect_version=$(echo $detect_version | tr '[:lower:]' '[:upper:]')
uppercase_version=$(echo $passed_version | tr '[:lower:]' '[:upper:]')

base_path="fixtures/generate-bundle-stats/$bundler"
out_file_name="$bundler-$passed_version-$format.config.$file_format"
out_file="$base_path/$out_file_name"

if test -f "$out_file"; then
    rm "$out_file"
fi

cat "$base_path"/$bundler-base.config.$file_format \
| sed "s/$detect_format/$format/g" \
| sed "s/$uppercase_detect_version/$uppercase_version/g" \
| sed "s/$detect_version/$passed_version/g" \
> "$out_file"