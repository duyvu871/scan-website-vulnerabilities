const headerTranslations = {
    'accept-ranges': {
        translated: 'Phạm vi tải xuống',
        usage: 'Cho biết server có hỗ trợ việc tải xuống một phần của tài nguyên (ví dụ: một phần của file) hay không. Ví dụ, nếu server hỗ trợ tải xuống theo byte, header này có thể là "bytes". Điều này cho phép client yêu cầu chỉ một phần của tài nguyên, chẳng hạn như tải xuống một phần video hoặc file lớn.'
    },
    'age': {
        translated: 'Thời gian lưu trữ cache',
        usage: 'Cho biết thời gian (tính bằng giây) mà response đã được lưu trữ trong cache. Thông tin này giúp client đánh giá độ "tươi" của dữ liệu. Response có tuổi càng cao, khả năng dữ liệu đã lỗi thời càng lớn.'
    },
    'allow': {
        translated: 'Phương thức được phép',
        usage: 'Liệt kê các phương thức HTTP (GET, POST, PUT, DELETE, ...) mà server cho phép thực hiện trên tài nguyên được yêu cầu. Ví dụ, nếu server chỉ cho phép GET và POST, header này sẽ là "GET, POST". Điều này giúp client biết được những hành động nào có thể thực hiện với tài nguyên.'
    },
    'content-encoding': {
        translated: 'Kiểu nén',
        usage: 'Cho biết phương thức mã hóa (nén) được sử dụng cho nội dung response. Ví dụ, nếu response được nén bằng gzip, header này sẽ là "gzip". Trình duyệt hoặc client sẽ sử dụng thông tin này để giải nén dữ liệu trước khi hiển thị hoặc xử lý.'
    },
    'content-language': {
        translated: 'Ngôn ngữ',
        usage: 'Chỉ định ngôn ngữ của nội dung response. Ví dụ, nếu nội dung là tiếng Việt, header này sẽ là "vi". Trình duyệt có thể sử dụng thông tin này để hiển thị nội dung bằng ngôn ngữ phù hợp hoặc ưu tiên hiển thị nội dung bằng ngôn ngữ mà người dùng đã thiết lập.'
    },
    'content-length': {
        translated: 'Kích thước nội dung',
        usage: 'Cho biết kích thước (tính bằng byte) của nội dung response. Trình duyệt sử dụng thông tin này để hiển thị tiến trình tải xuống, ước tính thời gian tải xuống và phân bổ bộ nhớ cần thiết.'
    },
    'content-location': {
        translated: 'Vị trí nội dung thực tế',
        usage: 'Cung cấp URL của tài nguyên được trả về trong response. Ví dụ, nếu request ban đầu là GET /resource, nhưng server trả về nội dung từ /other-resource, header này sẽ là "/other-resource". Điều này giúp client biết được vị trí thực tế của tài nguyên.'
    },
    'content-range': {
        translated: 'Phạm vi nội dung',
        usage: 'Chỉ định phần của tài nguyên được trả về trong response. Thường được sử dụng khi client yêu cầu một phần của tài nguyên (ví dụ: byte range). Ví dụ, "bytes 200-1000/67589" cho biết response chứa byte từ 200 đến 1000 của một tài nguyên có kích thước 67589 byte.'
    },
    'content-type': {
        translated: 'Kiểu nội dung',
        usage: 'Chỉ định kiểu nội dung (MIME type) của response. Ví dụ, "text/html" cho HTML, "image/jpeg" cho JPEG, "application/json" cho JSON. Trình duyệt sử dụng thông tin này để xác định cách xử lý và hiển thị nội dung.'
    },
    'etag': {
        translated: 'Mã định danh phiên bản',
        usage: 'Mã định danh duy nhất cho một phiên bản cụ thể của tài nguyên. Được sử dụng cho caching. Trình duyệt có thể sử dụng ETag để xác định xem phiên bản tài nguyên được lưu trong cache có còn hợp lệ hay không. Nếu ETag khớp với ETag của tài nguyên trên server, server sẽ trả về response 304 Not Modified, cho biết tài nguyên chưa thay đổi.'
    },
    'expires': {
        translated: 'Thời điểm hết hạn',
        usage: 'Chỉ định thời điểm response sẽ hết hạn. Trình duyệt có thể sử dụng thông tin này để quyết định có sử dụng cache hay không. Nếu thời điểm hiện tại vượt quá thời điểm hết hạn, trình duyệt sẽ gửi request mới đến server.'
    },
    'last-modified': {
        translated: 'Thời điểm sửa đổi',
        usage: 'Chỉ định thời điểm tài nguyên được sửa đổi lần cuối. Trình duyệt có thể sử dụng thông tin này để xác định xem phiên bản tài nguyên được lưu trong cache có còn hợp lệ hay không. Nếu thời điểm sửa đổi lần cuối khớp với thời điểm sửa đổi lần cuối của tài nguyên trên server, server sẽ trả về response 304 Not Modified.'
    },
    'location': {
        translated: 'Đường dẫn chuyển hướng',
        usage: 'Được sử dụng trong response chuyển hướng (redirect), chỉ định URL mà client nên chuyển hướng đến. Ví dụ, nếu server muốn chuyển hướng client đến /login, header này sẽ là "/login". Trình duyệt sẽ tự động chuyển hướng client đến URL được chỉ định.'
    },
    'proxy-authenticate': {
        translated: 'Yêu cầu xác thực proxy',
        usage: 'Yêu cầu client xác thực với proxy. Ví dụ, nếu proxy yêu cầu xác thực Basic, header này có thể là "Basic realm=\"Proxy\"". Client sẽ cung cấp thông tin xác thực để truy cập tài nguyên.'
    },
    'retry-after': {
        translated: 'Thử lại sau',
        usage: 'Cho biết thời gian (tính bằng giây) mà client nên thử lại request. Thường được sử dụng với response 503 Service Unavailable, cho biết server đang tạm thời không khả dụng. Header này có thể là một số nguyên (ví dụ: "30") hoặc thời điểm cụ thể (ví dụ: "Fri, 06 Oct 2024 08:00:00 GMT").'
    },
    'server': {
        translated: 'Thông tin server',
        usage: 'Cung cấp thông tin về server, ví dụ: tên và phiên bản của web server. Ví dụ, "Apache/2.4.54 (Ubuntu)". Thông tin này có thể hữu ích cho việc gỡ lỗi hoặc phân tích.'
    },
    'set-cookie': {
        translated: 'Thiết lập Cookie',
        usage: 'Thiết lập cookie cho client. Cookie là một đoạn dữ liệu nhỏ mà server gửi đến client và được lưu trữ trên máy tính của client. Cookie được sử dụng để lưu trữ thông tin trạng thái, ví dụ: session ID, tùy chọn người dùng, ... Ví dụ, "sessionid=1234567890; expires=Fri, 06 Oct 2024 08:00:00 GMT; path=/".'
    },
    'strict-transport-security': {
        translated: 'Chỉ sử dụng HTTPS',
        usage: 'Chỉ thị cho trình duyệt chỉ sử dụng HTTPS để giao tiếp với server. Điều này giúp ngăn chặn tấn công Man-in-the-Middle, bảo vệ dữ liệu truyền tải. Ví dụ, "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload".'
    },
    'vary': {
        translated: 'Header ảnh hưởng đến cache',
        usage: 'Chỉ định các header request ảnh hưởng đến việc cache response. Ví dụ, nếu response khác nhau tùy thuộc vào header "Accept-Language", header Vary sẽ là "Accept-Language". Điều này giúp cache server xác định xem phiên bản cache nào phù hợp với request.'
    },
    'ww-authenticate': {
        translated: 'Yêu cầu xác thực server',
        usage: 'Yêu cầu client xác thực với server. Ví dụ, nếu server yêu cầu xác thực Basic, header này có thể là "Basic realm=\"My Website\"". Client sẽ cung cấp thông tin xác thực để truy cập tài nguyên.'
    },
    'x-powered-by': {
        translated: 'Công nghệ server',
        usage: 'Cung cấp thông tin về công nghệ được sử dụng bởi server. Ví dụ, "PHP/7.4.33" hoặc "Express". Thông tin này có thể hữu ích cho việc gỡ lỗi hoặc phân tích, nhưng cũng có thể tiết lộ thông tin nhạy cảm về server.'
    },
    'cache-control': {
        translated: 'Kiểm soát cache',
        usage: 'Chỉ định cách mà response được cache. Ví dụ, "no-cache" cho biết response không thể được cache, "max-age=3600" cho biết response có thể được cache trong 1 giờ. Header này có thể chứa nhiều chỉ thị, ví dụ: "no-store, private, must-revalidate".'
    },
    "connection": {
        translated: "Kết nối",
        usage: "Chỉ định cách client kết nối với server. Ví dụ, 'keep-alive' cho biết client sẽ duy trì kết nối mở với server, 'close' cho biết client sẽ đóng kết nối sau khi hoàn thành request."
    },
    "date": {
        translated: "Thời điểm tạo response",
        usage: "Chỉ định thời điểm mà response được tạo ra. Thông tin này có thể hữu ích cho việc xác định độ \"tươi\" của dữ liệu, gỡ lỗi hoặc phân tích."
    },
    "pragma": {
        translated: "Chỉ thị",
        usage: "Chỉ định cách mà server xử lý response hoặc request. Ví dụ, 'no-cache' cho biết client không nên cache response, 'no-store' cho biết client không nên lưu trữ response."
    },
    "trailer": {
        translated: "Trailer",
        usage: "Chỉ định các header mà sẽ được gửi sau phần nội dung của response. Trailer header thường được sử dụng trong trường hợp response có thể chứa dữ liệu không xác định trước."
    },
    "transfer-encoding": {
        translated: "Mã hóa chuyển giao",
        usage: "Chỉ định phương thức mã hóa (nén) được sử dụng để truyền tải nội dung response. Ví dụ, 'chunked' cho biết nội dung được truyền tải theo dạng chunked encoding."
    },
    "upgrade": {
        translated: "Nâng cấp",
        usage: "Chỉ định các giao thức mà client muốn nâng cấp. Ví dụ, 'h2c' cho biết client muốn nâng cấp lên HTTP/2."
    },
    "via": {
        translated: "Đường dẫn",
        usage: "Chỉ định các proxy server mà request đã đi qua. Header này thường được sử dụng trong trường hợp request đi qua nhiều proxy server."
    },
    "warning": {
        translated: "Cảnh báo",
        usage: "Chứa các cảnh báo hoặc thông tin khác về response. Ví dụ, '110 - Response is stale' cho biết response đã lỗi thời."
    },
    "x-content-type-options": {
        translated: "Tùy chọn kiểu nội dung",
        usage: "Chỉ định cách mà trình duyệt xử lý kiểu nội dung của response. Ví dụ, 'nosniff' cho biết trình duyệt không nên tự đoán kiểu nội dung của response."
    },
    "x-frame-options": {
        translated: "Tùy chọn khung",
        usage: "Chỉ định cách mà trang web được nhúng vào khung (frame). Ví dụ, 'DENY' cho biết trang web không thể được nhúng vào khung từ một trang khác."
    },
    "x-xss-protection": {
        translated: "Bảo vệ XSS",
        usage: "Chỉ định cách mà trình duyệt bảo vệ khỏi tấn công Cross-Site Scripting (XSS). Ví dụ, '1; mode=block' cho biết trình duyệt sẽ chặn bất kỳ mã JavaScript độc hại nào."
    },
    "content-security-policy": {
        translated: "Chính sách bảo mật nội dung",
        usage: "Chỉ định các nguồn mà trang web được phép tải tài nguyên từ. Chính sách bảo mật nội dung giúp ngăn chặn tấn công Cross-Site Scripting (XSS) và các mối đe dọa khác."
    },
    "x-content-security-policy": {
        translated: "Chính sách bảo mật nội dung",
        usage: "Chỉ định các nguồn mà trang web được phép tải tài nguyên từ. Chính sách bảo mật nội dung giúp ngăn chặn tấn công Cross-Site Scripting (XSS) và các mối đe dọa khác."
    },
    "x-webkit-csp": {
        translated: "Chính sách bảo mật nội dung",
        usage: "Chỉ định các nguồn mà trang web được phép tải tài nguyên từ. Chính sách bảo mật nội dung giúp ngăn chặn tấn công Cross-Site Scripting (XSS) và các mối đe dọa khác."
    },
    "x-dns-prefetch-control": {
        translated: "Kiểm soát DNS Prefetch",
        usage: "Chỉ định cách mà trình duyệt xử lý DNS prefetching. DNS prefetching giúp trình duyệt tải trước các tài nguyên cần thiết, cải thiện thời gian tải trang."
    },
    "x-download-options": {
        translated: "Tùy chọn tải xuống",
        usage: "Chỉ định cách mà trình duyệt xử lý tải xuống tài nguyên. Ví dụ, 'noopen' cho biết trình duyệt không nên mở tài nguyên ngay sau khi tải xuống."
    },
    "x-permitted-cross-domain-policies": {
        translated: "Chính sách chéo miền được phép",
        usage: "Chỉ định cách mà trang web xử lý các request từ miền khác. Chính sách chéo miền giúp ngăn chặn tấn công Cross-Site Request Forgery (CSRF)."
    },
    "x-request-id": {
        translated: "ID yêu cầu",
        usage: "Chỉ định ID duy nhất cho mỗi request. ID yêu cầu giúp theo dõi và gỡ lỗi request."
    },
    "x-robots-tag": {
        translated: "Thẻ Robots",
        usage: "Chỉ định cách mà trình duyệt xử lý các robot (công cụ tìm kiếm). Ví dụ, 'noindex' cho biết robot không nên lập chỉ mục trang web."
    },
    "x-ua-compatible": {
        translated: "Tương thích trình duyệt",
        usage: "Chỉ định cách mà trình duyệt xử lý trang web. Ví dụ, 'IE=edge' cho biết trình duyệt Internet Explorer nên sử dụng chế độ tương thích mới nhất."
    },
};

export { headerTranslations };