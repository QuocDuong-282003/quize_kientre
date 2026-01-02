require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Exam = require('./models/Exam');
const connectDB = require('./config/db');

// Exam catalog (4 cards)
const examSeeds = [
    {
        title: 'Kiểm tra kiến thức cơ bản lập trình',
        code: 'BASIC-PROGRAMMING',
        description: 'Kiến thức nền tảng: HTML, CSS, JS, SQL cơ bản',
        category: 'Lập trình',
        tags: ['JS', 'HTML', 'CSS', 'SQL'],

        examDate: new Date('2026-1-1'),

    },
    {
        title: 'Hướng đối tượng (OOP)',
        code: 'OOP-ADVANCED',
        description: 'OOP, SOLID, Design Patterns, kế thừa, đa hình, đóng gói',
        category: 'Lập trình nâng cao',
        tags: ['OOP', 'Design Patterns', 'SOLID'],

        examDate: new Date('2026-1-1'),


    },
    {
        title: 'MySQL & Cơ sở dữ liệu',
        code: 'MYSQL-DATABASE',
        description: 'Thiết kế DB, MySQL queries, indexing, optimization, transactions',
        category: 'Cơ sở dữ liệu',
        tags: ['MySQL', 'SQL', 'Database', 'Performance'],

        examDate: new Date('2026-1-1'),

    },
    {
        title: 'REST API & Backend',
        code: 'REST-API-BACKEND',
        description: 'Node.js, Express, REST design, auth, middleware, error handling',
        category: 'Backend',
        tags: ['REST API', 'Node.js', 'Express', 'Backend'],

        examDate: new Date('2026-1-1'),

    }
];

// Basic programming (reuse existing 55 questions)
const basicProgrammingQuestions = [
    // --- DIFFICULTY 1: WEB FUNDAMENTALS & BASIC DB (11 câu) ---
    { content: "Thẻ <head> trong HTML dùng để làm gì?", options: [{ id: 1, text: "Chứa thông tin meta, tiêu đề và link CSS" }, { id: 2, text: "Hiển thị nội dung chính của trang web" }, { id: 3, text: "Định nghĩa kiểu font chữ" }, { id: 4, text: "Tạo animation" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Trong SQL, từ khóa nào dùng để lấy dữ liệu?", options: [{ id: 1, text: "GET" }, { id: 2, text: "SELECT" }, { id: 3, text: "FETCH" }, { id: 4, text: "READ" }], correctAnswerIds: [2], difficulty: 1 },
    { content: "Primary Key (Khóa chính) trong Database dùng để làm gì?", options: [{ id: 1, text: "Định danh duy nhất cho mỗi bản ghi" }, { id: 2, text: "Dùng để mã hóa dữ liệu" }, { id: 3, text: "Tăng tốc độ truy vấn" }, { id: 4, text: "Xóa dữ liệu cũ" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Kiểu dữ liệu nào dùng để lưu trữ văn bản dài trong JS?", options: [{ id: 1, text: "String" }, { id: 2, text: "Boolean" }, { id: 3, text: "Number" }, { id: 4, text: "Array" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "CSS Box Model gồm những thành phần nào?", options: [{ id: 1, text: "Margin, Border, Padding, Content" }, { id: 2, text: "Header, Footer, Main, Aside" }, { id: 3, text: "Width, Height, Color, Font" }, { id: 4, text: "Display, Position, Flex, Grid" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Lệnh 'DELETE' khác gì 'TRUNCATE' trong SQL?", options: [{ id: 1, text: "DELETE có thể dùng WHERE, TRUNCATE xóa toàn bộ bảng nhanh hơn" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "DELETE nhanh hơn TRUNCATE" }, { id: 4, text: "TRUNCATE có thể dùng WHERE" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Trong JavaScript, mảng (Array) là một kiểu của?", options: [{ id: 1, text: "Object" }, { id: 2, text: "Primitive" }, { id: 3, text: "Function" }, { id: 4, text: "String" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Thẻ <script> thường được đặt ở đâu để tối ưu tốc độ load trang?", options: [{ id: 1, text: "Cuối thẻ <body>" }, { id: 2, text: "Đầu thẻ <head>" }, { id: 3, text: "Trong thẻ <div>" }, { id: 4, text: "Ngoài HTML" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Dấu '!' trong logic lập trình có nghĩa là gì?", options: [{ id: 1, text: "Phép phủ định (NOT)" }, { id: 2, text: "Phép gán" }, { id: 3, text: "Phép cộng" }, { id: 4, text: "Phép so sánh" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Trong SQL, 'ORDER BY' dùng để làm gì?", options: [{ id: 1, text: "Sắp xếp kết quả trả về" }, { id: 2, text: "Lọc dữ liệu theo điều kiện" }, { id: 3, text: "Nhóm dữ liệu" }, { id: 4, text: "Xóa dữ liệu" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Responsive Design có mục đích gì?", options: [{ id: 1, text: "Giúp trang web hiển thị tốt trên nhiều thiết bị" }, { id: 2, text: "Giúp trang web chạy nhanh hơn" }, { id: 3, text: "Tăng dung lượng server" }, { id: 4, text: "Giảm số người truy cập" }], correctAnswerIds: [1], difficulty: 1 },

    // --- DIFFICULTY 2: INTERMEDIATE DEV & DB RELATIONSHIPS (11 câu) ---
    { content: "Foreign Key (Khóa ngoại) dùng để làm gì?", options: [{ id: 1, text: "Tạo liên kết giữa hai bảng" }, { id: 2, text: "Tăng tốc độ tìm kiếm" }, { id: 3, text: "Mã hóa dữ liệu" }, { id: 4, text: "Xóa bảng cũ" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Trong Git, lệnh nào dùng để đưa code từ local lên server?", options: [{ id: 1, text: "git pull" }, { id: 2, text: "git push" }, { id: 3, text: "git fetch" }, { id: 4, text: "git clone" }], correctAnswerIds: [2], difficulty: 2 },
    { content: "Sự khác biệt giữa INNER JOIN và LEFT JOIN?", options: [{ id: 1, text: "LEFT JOIN lấy cả các bản ghi không khớp ở bảng bên trái" }, { id: 2, text: "INNER JOIN lấy toàn bộ dữ liệu 2 bảng" }, { id: 3, text: "LEFT JOIN nhanh hơn INNER JOIN" }, { id: 4, text: "INNER JOIN lấy cả dữ liệu 2 bảng" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Trạng thái HTTP 404 có nghĩa là gì?", options: [{ id: 1, text: "Server Error" }, { id: 2, text: "Not Found" }, { id: 3, text: "Bad Request" }, { id: 4, text: "Unauthorized" }], correctAnswerIds: [2], difficulty: 2 },
    { content: "State trong React khác gì Props?", options: [{ id: 1, text: "State có thể thay đổi bên trong component, Props là dữ liệu truyền vào" }, { id: 2, text: "Props là private, State là public" }, { id: 3, text: "State nhanh hơn Props" }, { id: 4, text: "Giống hệt nhau" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Lệnh 'GROUP BY' trong SQL thường đi kèm với hàm nào?", options: [{ id: 1, text: "COUNT, SUM, AVG" }, { id: 2, text: "SELECT, INSERT" }, { id: 3, text: "WHERE, ORDER BY" }, { id: 4, text: "JOIN, UNION" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Arrow Function trong ES6 khác gì function thường?", options: [{ id: 1, text: "Không có 'this' riêng" }, { id: 2, text: "Chạy chậm hơn" }, { id: 3, text: "Cú pháp ngắn gọn hơn" }, { id: 4, text: "Không thể dùng async" }], correctAnswerIds: [1, 3], difficulty: 2 },
    { content: "Trong SQL, làm thế nào để tránh trùng lặp kết quả?", options: [{ id: 1, text: "Dùng từ khóa DISTINCT" }, { id: 2, text: "Dùng từ khóa UNIQUE" }, { id: 3, text: "Dùng GROUP BY" }, { id: 4, text: "Không thể tránh" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "npm install --save-dev dùng để làm gì?", options: [{ id: 1, text: "Cài đặt thư viện chỉ dùng trong môi trường phát triển" }, { id: 2, text: "Cài đặt thư viện lên production" }, { id: 3, text: "Cập nhật tất cả thư viện" }, { id: 4, text: "Xóa thư viện" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Flexbox trong CSS dùng để làm gì?", options: [{ id: 1, text: "Dàn trang linh hoạt theo hàng hoặc cột" }, { id: 2, text: "Tạo hiệu ứng 3D" }, { id: 3, text: "Tạo animation" }, { id: 4, text: "Quản lý font chữ" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Xử lý bất đồng bộ cơ bản nhất trong JS là?", options: [{ id: 1, text: "Callback" }, { id: 2, text: "Loop" }, { id: 3, text: "Promise" }, { id: 4, text: "async/await" }], correctAnswerIds: [1], difficulty: 2 },

    // --- DIFFICULTY 3: ADVANCED DEV & DB ARCHITECTURE (11 câu) ---
    { content: "ACID trong Database viết tắt của gì?", options: [{ id: 1, text: "Atomicity, Consistency, Isolation, Durability" }, { id: 2, text: "Access, Control, Index, Data" }, { id: 3, text: "Append, Create, Import, Delete" }, { id: 4, text: "Authentication, Cache, Input, Display" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "React.memo() dùng để làm gì?", options: [{ id: 1, text: "Tránh re-render component nếu props không đổi" }, { id: 2, text: "Lưu dữ liệu vào bộ nhớ máy" }, { id: 3, text: "Tối ưu hóa JavaScript" }, { id: 4, text: "Xóa component" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Mục đích của Database Normalization (Chuẩn hóa)?", options: [{ id: 1, text: "Giảm dư thừa dữ liệu và đảm bảo tính nhất quán" }, { id: 2, text: "Để dữ liệu chiếm nhiều dung lượng hơn" }, { id: 3, text: "Tăng tốc độ database" }, { id: 4, text: "Xóa các cột không dùng" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Middleware trong Node.js/Express là gì?", options: [{ id: 1, text: "Hàm trung gian xử lý Request trước khi đến Controller" }, { id: 2, text: "Một loại cơ sở dữ liệu" }, { id: 3, text: "Plugin cho frontend" }, { id: 4, text: "Giao thức mạng" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Sự khác biệt giữa PUT và PATCH?", options: [{ id: 1, text: "PUT thay thế toàn bộ, PATCH cập nhật một phần" }, { id: 2, text: "PATCH nhanh hơn PUT" }, { id: 3, text: "PUT chỉ dùng cho cập nhật" }, { id: 4, text: "Giống hệt nhau" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Trong SQL, 'HAVING' khác 'WHERE' ở điểm nào?", options: [{ id: 1, text: "HAVING dùng để lọc sau khi đã GROUP BY" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "WHERE nhanh hơn HAVING" }, { id: 4, text: "HAVING dùng cho tất cả câu lệnh" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Controlled Component trong React là gì?", options: [{ id: 1, text: "Component có dữ liệu form được quản lý bởi State" }, { id: 2, text: "Component không thể bị xóa" }, { id: 3, text: "Component hiển thị dữ liệu cố định" }, { id: 4, text: "Component không có props" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Tại sao nên dùng mảng để lưu danh sách ID trong MongoDB?", options: [{ id: 1, text: "Để thực hiện các truy vấn quan hệ kiểu One-to-Many nhanh" }, { id: 2, text: "MongoDB không hỗ trợ bảng" }, { id: 3, text: "Tiết kiệm dung lượng" }, { id: 4, text: "Không có lý do" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Hàm .reduce() trong JS dùng để làm gì?", options: [{ id: 1, text: "Biến đổi mảng thành một giá trị duy nhất" }, { id: 2, text: "Xóa các phần tử trong mảng" }, { id: 3, text: "Sắp xếp mảng" }, { id: 4, text: "Lọc phần tử mảng" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Virtual DOM giúp React nhanh hơn nhờ?", options: [{ id: 1, text: "Chỉ cập nhật những phần thực sự thay đổi trên Real DOM" }, { id: 2, text: "Bỏ qua CSS" }, { id: 3, text: "Xóa JavaScript" }, { id: 4, text: "Không có tác dụng" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Trong Database, 'Transaction' là gì?", options: [{ id: 1, text: "Một nhóm các câu lệnh SQL thực thi như một đơn vị duy nhất" }, { id: 2, text: "Lịch sử mua hàng" }, { id: 3, text: "Một bảng trong database" }, { id: 4, text: "Kết nối server" }], correctAnswerIds: [1], difficulty: 3 },

    // --- DIFFICULTY 4: SYSTEM PERFORMANCE & DB TUNING (11 câu) ---
    { content: "B-Tree Index hoạt động thế nào trong SQL?", options: [{ id: 1, text: "Sắp xếp dữ liệu theo dạng cây để tìm kiếm với độ phức tạp O(log n)" }, { id: 2, text: "Quét toàn bộ bảng từ đầu đến cuối" }, { id: 3, text: "Dùng hashtable" }, { id: 4, text: "Sử dụng linked list" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Tại sao không nên đánh Index cho tất cả các cột?", options: [{ id: 1, text: "Làm chậm thao tác ghi (INSERT/UPDATE)" }, { id: 2, text: "Làm database bị lỗi" }, { id: 3, text: "Tiêu tốn quá nhiều bộ nhớ" }, { id: 4, text: "Không có lý do" }], correctAnswerIds: [1, 3], difficulty: 4 },
    { content: "JWT (JSON Web Token) gồm 3 phần nào?", options: [{ id: 1, text: "Header, Payload, Signature" }, { id: 2, text: "Username, Password, Salt" }, { id: 3, text: "Token, Key, Data" }, { id: 4, text: "Encrypt, Hash, Random" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Cơ chế 'Sharding' trong Database là gì?", options: [{ id: 1, text: "Chia nhỏ một Database lớn thành nhiều server vật lý" }, { id: 2, text: "Sao chép dữ liệu để dự phòng" }, { id: 3, text: "Nén dữ liệu" }, { id: 4, text: "Tạo backup" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Event Delegation trong JavaScript là gì?", options: [{ id: 1, text: "Gắn sự kiện vào phần tử cha để quản lý các phần tử con" }, { id: 2, text: "Xóa bỏ sự kiện" }, { id: 3, text: "Tạo sự kiện mới" }, { id: 4, text: "Từ chối sự kiện" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Sự khác biệt giữa NoSQL (Document) và RDBMS?", options: [{ id: 1, text: "NoSQL schema linh hoạt, RDBMS schema cố định" }, { id: 2, text: "RDBMS luôn nhanh hơn NoSQL" }, { id: 3, text: "NoSQL không thể store dữ liệu" }, { id: 4, text: "RDBMS dùng cho web 3" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Tại sao dùng Redis làm Cache?", options: [{ id: 1, text: "Vì nó lưu trữ trên RAM, tốc độ đọc ghi cực nhanh" }, { id: 2, text: "Vì nó lưu trữ được nhiều dữ liệu hơn ổ cứng" }, { id: 3, text: "Vì nó là open source" }, { id: 4, text: "Vì nó có giao diện đẹp" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "CORS (Cross-Origin Resource Sharing) là gì?", options: [{ id: 1, text: "Cơ chế bảo mật trình duyệt ngăn gọi API khác domain" }, { id: 2, text: "Một giao thức mạng mới" }, { id: 3, text: "Loại cookie" }, { id: 4, text: "Mã hóa dữ liệu" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Thế nào là 'N+1 Query Problem' trong ORM?", options: [{ id: 1, text: "Gây ra quá nhiều câu lệnh SQL lẻ tẻ khi lấy dữ liệu liên quan" }, { id: 2, text: "Lỗi cú pháp SQL" }, { id: 3, text: "Tình huống database bị lỗi" }, { id: 4, text: "Lỗi khi compile code" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Hàm 'bind' trong JS dùng để làm gì?", options: [{ id: 1, text: "Tạo một hàm mới với giá trị 'this' được chỉ định" }, { id: 2, text: "Nối hai chuỗi" }, { id: 3, text: "Xóa dữ liệu" }, { id: 4, text: "Tạo object mới" }], correctAnswerIds: [1], difficulty: 4 },
    { content: "Database Replication mục đích chính là?", options: [{ id: 1, text: "Tăng tính sẵn sàng và khả năng chịu lỗi" }, { id: 2, text: "Tiết kiệm dung lượng" }, { id: 3, text: "Tăng tốc độ lưu trữ" }, { id: 4, text: "Giảm chi phí server" }], correctAnswerIds: [1], difficulty: 4 },

    // --- DIFFICULTY 5: SENIOR ARCHITECTURE & COMPLEX DB (11 câu) ---
    { content: "CAP Theorem khẳng định điều gì trong hệ thống phân tán?", options: [{ id: 1, text: "Chỉ có thể chọn 2 trong 3: Consistency, Availability, Partition Tolerance" }, { id: 2, text: "Database luôn phải có 3 tính chất" }, { id: 3, text: "Tất cả hệ thống phân tán đều có CAP" }, { id: 4, text: "Không thể chọn bất kỳ tính chất nào" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Sự khác biệt giữa Optimistic và Pessimistic Locking?", options: [{ id: 1, text: "Optimistic check phiên bản khi update, Pessimistic khóa dòng dữ liệu ngay từ đầu" }, { id: 2, text: "Optimistic chậm hơn Pessimistic" }, { id: 3, text: "Optimistic luôn an toàn hơn" }, { id: 4, text: "Pessimistic không sử dụng database" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Cơ chế 'Event Loop' xử lý Microtasks (Promise) và Macrotasks (setTimeout) thế nào?", options: [{ id: 1, text: "Xử lý hết toàn bộ Microtasks trước khi sang Macrotask tiếp theo" }, { id: 2, text: "Xử lý xen kẽ 1-1" }, { id: 3, text: "Chỉ xử lý Microtasks" }, { id: 4, text: "Chỉ xử lý Macrotasks" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Làm thế nào để tối ưu một truy vấn SQL chạy chậm?", options: [{ id: 1, text: "Dùng EXPLAIN để phân tích execution plan và đánh index phù hợp" }, { id: 2, text: "Xóa bớt dữ liệu" }, { id: 3, text: "Tăng RAM server" }, { id: 4, text: "Không thể tối ưu" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "CQRS (Command Query Responsibility Segregation) là gì?", options: [{ id: 1, text: "Tách biệt logic ghi (Command) và đọc (Query) dữ liệu" }, { id: 2, text: "Một cách đặt tên biến" }, { id: 3, text: "Mẫu lập trình không tồn tại" }, { id: 4, text: "Loại API" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Tại sao 'Deep Equality' trong JS lại tốn kém tài nguyên?", options: [{ id: 1, text: "Phải đệ quy qua toàn bộ các thuộc tính của object lồng nhau" }, { id: 2, text: "Vì nó so sánh địa chỉ ô nhớ" }, { id: 3, text: "Vì nó cần compile" }, { id: 4, text: "Vì JavaScript chậm" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Database Index lồng (Composite Index) hoạt động hiệu quả nhất khi?", options: [{ id: 1, text: "Truy vấn tuân theo quy tắc 'Leftmost Prefix'" }, { id: 2, text: "Truy vấn cột nào cũng được" }, { id: 3, text: "Index lồng luôn vô dụng" }, { id: 4, text: "Không có quy tắc" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Trong Node.js, Worker Threads dùng để làm gì?", options: [{ id: 1, text: "Xử lý các tác vụ tính toán nặng (CPU intensive) mà không làm block Event Loop" }, { id: 2, text: "Xử lý Request của người dùng" }, { id: 3, text: "Quản lý database" }, { id: 4, text: "Tạo web interface" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Giao thức gRPC sử dụng cái gì để truyền tải dữ liệu hiệu quả hơn REST?", options: [{ id: 1, text: "HTTP/2 và Protocol Buffers (Binary)" }, { id: 2, text: "JSON và HTTP/1.1" }, { id: 3, text: "XML và WebSocket" }, { id: 4, text: "CSV và FTP" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Tính chất 'Isolation' trong ACID ở mức 'Serializable' có ý nghĩa gì?", options: [{ id: 1, text: "Đảm bảo kết quả giống như các transaction chạy tuần tự" }, { id: 2, text: "Cho phép đọc dữ liệu rác (Dirty Read)" }, { id: 3, text: "Cho phép transaction xung đột" }, { id: 4, text: "Không có ý nghĩa gì" }], correctAnswerIds: [1], difficulty: 5 },
    { content: "Làm thế nào để xử lý 'Race Condition' khi hai request cùng cập nhật số dư ví điện tử?", options: [{ id: 1, text: "Sử dụng Atomic Update hoặc Database Lock" }, { id: 2, text: "Dùng if-else ở code backend" }, { id: 3, text: "Không thể xử lý race condition" }, { id: 4, text: "Tạo thread mới" }], correctAnswerIds: [1], difficulty: 5 }
];

// OOP & Design Patterns
const oopQuestions = [
    { content: "Tính kế thừa (Inheritance) trong OOP cho phép làm gì?", options: [{ id: 1, text: "Lớp con thừa hưởng thuộc tính và phương thức từ lớp cha" }, { id: 2, text: "Xóa các phương thức không dùng" }, { id: 3, text: "Nén dữ liệu lớp" }, { id: 4, text: "Tạo nhiều instance cùng lúc" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Tính đa hình (Polymorphism) là gì?", options: [{ id: 1, text: "Một đối tượng có thể nhận nhiều hình thái khác nhau" }, { id: 2, text: "Tạo nhiều lớp giống nhau" }, { id: 3, text: "Xóa lớp cũ" }, { id: 4, text: "Sao chép code" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Tính đóng gói (Encapsulation) mục đích chính là?", options: [{ id: 1, text: "Che giấu dữ liệu nội bộ và chỉ cung cấp giao diện công khai" }, { id: 2, text: "Tạo mật khẩu" }, { id: 3, text: "Mã hóa dữ liệu" }, { id: 4, text: "Xóa dữ liệu" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Singleton Design Pattern dùng để làm gì?", options: [{ id: 1, text: "Đảm bảo chỉ có một instance duy nhất của lớp" }, { id: 2, text: "Tạo nhiều instance" }, { id: 3, text: "Xóa instance" }, { id: 4, text: "Sao chép class" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Factory Pattern khác gì Direct Instantiation?", options: [{ id: 1, text: "Factory tách logic tạo object, dễ bảo trì hơn" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "Direct Instantiation nhanh hơn" }, { id: 4, text: "Không có khác biệt" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Abstract Class khác gì Interface?", options: [{ id: 1, text: "Abstract Class có thể có implementation, Interface chỉ khai báo" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "Interface mạnh hơn" }, { id: 4, text: "Abstract Class không dùng được" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "SOLID Principle gồm những gì?", options: [{ id: 1, text: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion" }, { id: 2, text: "String, Object, List, Integer, Double" }, { id: 3, text: "SQL, Optimization, Logging, Indexing, Dynamic" }, { id: 4, text: "Storage, Order, Library, Input, Data" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Observer Pattern dùng để làm gì?", options: [{ id: 1, text: "Tạo quan hệ one-to-many để observer được thông báo khi đối tượng thay đổi" }, { id: 2, text: "Giám sát database" }, { id: 3, text: "Đếm số user" }, { id: 4, text: "Quản lý file" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Static method trong OOP có thể được gọi mà không cần?", options: [{ id: 1, text: "Tạo instance của lớp" }, { id: 2, text: "Khai báo biến" }, { id: 3, text: "Import thư viện" }, { id: 4, text: "Định nghĩa constructor" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Method Overloading là gì?", options: [{ id: 1, text: "Cùng tên hàm nhưng khác số lượng hoặc kiểu tham số" }, { id: 2, text: "Gọi hàm nhiều lần" }, { id: 3, text: "Xóa hàm" }, { id: 4, text: "Sao chép hàm" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Constructor trong OOP dùng để làm gì?", options: [{ id: 1, text: "Khởi tạo trạng thái ban đầu của object" }, { id: 2, text: "Xóa object" }, { id: 3, text: "Sao chép object" }, { id: 4, text: "Kiểm tra kiểu dữ liệu" }], correctAnswerIds: [1], difficulty: 2 },
];

// MySQL & Database
const mysqlQuestions = [
    { content: "MySQL dùng để quản lý kiểu dữ liệu nào?", options: [{ id: 1, text: "Dữ liệu quan hệ (Relational Data)" }, { id: 2, text: "Dữ liệu JSON" }, { id: 3, text: "Dữ liệu nhị phân" }, { id: 4, text: "Tất cả các loại" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Lệnh CREATE TABLE dùng để làm gì?", options: [{ id: 1, text: "Tạo một bảng mới trong database" }, { id: 2, text: "Tạo column mới" }, { id: 3, text: "Xóa bảng" }, { id: 4, text: "Sao chép bảng" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Cột AUTO_INCREMENT dùng để làm gì?", options: [{ id: 1, text: "Tự động tăng giá trị mỗi khi thêm bản ghi mới" }, { id: 2, text: "Tự động xóa dữ liệu" }, { id: 3, text: "Tự động sao chép dữ liệu" }, { id: 4, text: "Tự động mã hóa" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Sự khác biệt giữa VARCHAR và CHAR?", options: [{ id: 1, text: "VARCHAR lưu độ dài động, CHAR lưu độ dài cố định" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "CHAR nhanh hơn" }, { id: 4, text: "VARCHAR tiết kiệm hơn" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "INDEX trong MySQL có mục đích gì?", options: [{ id: 1, text: "Tăng tốc độ truy vấn SELECT và WHERE" }, { id: 2, text: "Xóa dữ liệu" }, { id: 3, text: "Nén dữ liệu" }, { id: 4, text: "Tạo backup" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "UNIQUE constraint dùng để làm gì?", options: [{ id: 1, text: "Đảm bảo các giá trị trong cột là duy nhất" }, { id: 2, text: "Xóa bản ghi trùng" }, { id: 3, text: "Sao chép cột" }, { id: 4, text: "Mã hóa dữ liệu" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Bao nhiêu cột có thể đặt trong một INDEX lồng (Composite Index)?", options: [{ id: 1, text: "Tối đa 16 cột trong MySQL" }, { id: 2, text: "Chỉ 1 cột" }, { id: 3, text: "Không giới hạn" }, { id: 4, text: "Tối đa 3 cột" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "EXPLAIN trong MySQL dùng để làm gì?", options: [{ id: 1, text: "Phân tích execution plan của câu lệnh SQL" }, { id: 2, text: "Xóa câu lệnh" }, { id: 3, text: "Chạy câu lệnh" }, { id: 4, text: "Sao chép câu lệnh" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "View (Bảng ảo) trong MySQL dùng để làm gì?", options: [{ id: 1, text: "Tạo bảng ảo từ nhiều bảng để đơn giản hóa truy vấn" }, { id: 2, text: "Xóa dữ liệu" }, { id: 3, text: "Sao chép bảng" }, { id: 4, text: "Mã hóa dữ liệu" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Trigger trong MySQL được kích hoạt khi nào?", options: [{ id: 1, text: "Khi xảy ra sự kiện INSERT, UPDATE, hoặc DELETE" }, { id: 2, text: "Lúc khởi động server" }, { id: 3, text: "Lúc tắt server" }, { id: 4, text: "Bất cứ lúc nào" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Tại sao nên dùng Stored Procedure?", options: [{ id: 1, text: "Tăng bảo mật, tốc độ, và giảm traffic mạng" }, { id: 2, text: "Để xóa bảng nhanh" }, { id: 3, text: "Để mã hóa database" }, { id: 4, text: "Để tạo backup" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Partitioning trong MySQL là gì?", options: [{ id: 1, text: "Chia nhỏ một bảng lớn thành nhiều phần để tối ưu hiệu năng" }, { id: 2, text: "Xóa dữ liệu cũ" }, { id: 3, text: "Sao chép bảng" }, { id: 4, text: "Mã hóa bảng" }], correctAnswerIds: [1], difficulty: 4 },
];

// REST API & Backend
const restApiQuestions = [
    { content: "REST API viết tắt của gì?", options: [{ id: 1, text: "Representational State Transfer API" }, { id: 2, text: "Real-time Server Transfer API" }, { id: 3, text: "Relational Entity Service Transfer" }, { id: 4, text: "Resource Encoding Service Transfer" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "HTTP method POST dùng để làm gì?", options: [{ id: 1, text: "Tạo dữ liệu mới" }, { id: 2, text: "Lấy dữ liệu" }, { id: 3, text: "Cập nhật dữ liệu" }, { id: 4, text: "Xóa dữ liệu" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Status code 201 có nghĩa là gì?", options: [{ id: 1, text: "Created - Dữ liệu được tạo thành công" }, { id: 2, text: "Bad Request" }, { id: 3, text: "Unauthorized" }, { id: 4, text: "Server Error" }], correctAnswerIds: [1], difficulty: 1 },
    { content: "Bearer Token trong Authorization dùng để làm gì?", options: [{ id: 1, text: "Xác thực người dùng qua JWT token" }, { id: 2, text: "Mã hóa password" }, { id: 3, text: "Lưu session" }, { id: 4, text: "Tạo cookie" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Rate Limiting dùng để làm gì?", options: [{ id: 1, text: "Giới hạn số request từ một IP để tránh abuse" }, { id: 2, text: "Tăng tốc độ API" }, { id: 3, text: "Xóa request" }, { id: 4, text: "Sao chép request" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Error handling middleware trong Express được dùng khi nào?", options: [{ id: 1, text: "Khi có lỗi xảy ra trong request" }, { id: 2, text: "Lúc khởi động server" }, { id: 3, text: "Lúc shutdown" }, { id: 4, text: "Không bao giờ" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Idempotent request là gì?", options: [{ id: 1, text: "Gọi nhiều lần cũng có kết quả giống như gọi 1 lần" }, { id: 2, text: "Gọi mà không có kết quả" }, { id: 3, text: "Gọi và xóa dữ liệu" }, { id: 4, text: "Gọi ngẫu nhiên" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "Pagination trong API dùng để làm gì?", options: [{ id: 1, text: "Chia nhỏ dữ liệu lớn thành nhiều trang để giảm tải" }, { id: 2, text: "Xóa dữ liệu" }, { id: 3, text: "Mã hóa dữ liệu" }, { id: 4, text: "Sao chép dữ liệu" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Body Parser middleware trong Express dùng để làm gì?", options: [{ id: 1, text: "Parse JSON hoặc form data từ request body" }, { id: 2, text: "Xóa request body" }, { id: 3, text: "Mã hóa request" }, { id: 4, text: "Tạo response" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "Logging trong Backend nên làm gì?", options: [{ id: 1, text: "Ghi lại thông tin request/response để debug" }, { id: 2, text: "Xóa logs cũ" }, { id: 3, text: "Mã hóa logs" }, { id: 4, text: "Gửi logs" }], correctAnswerIds: [1], difficulty: 2 },
    { content: "API Versioning (v1, v2) dùng để làm gì?", options: [{ id: 1, text: "Quản lý nhiều phiên bản API để tránh break client cũ" }, { id: 2, text: "Xóa API cũ" }, { id: 3, text: "Tăng tốc độ" }, { id: 4, text: "Giảm bảo mật" }], correctAnswerIds: [1], difficulty: 3 },
    { content: "WebSocket khác gì HTTP polling?", options: [{ id: 1, text: "WebSocket là kết nối hai chiều liên tục, polling phải gọi liên tục" }, { id: 2, text: "Giống hệt nhau" }, { id: 3, text: "Polling nhanh hơn" }, { id: 4, text: "HTTP polling an toàn hơn" }], correctAnswerIds: [1], difficulty: 3 },
];

const seed = async () => {
    try {
        await connectDB();

        // Reset collections to avoid duplicate keys between runs
        await Promise.all([
            Question.deleteMany({}),
            Exam.deleteMany({})
        ]);

        // Create exams
        const createdExams = await Exam.insertMany(examSeeds);
        console.log(`Created ${createdExams.length} exams`);

        // Map exam codes to IDs
        const examMap = {
            'BASIC-PROGRAMMING': createdExams[0]._id,
            'OOP-ADVANCED': createdExams[1]._id,
            'MYSQL-DATABASE': createdExams[2]._id,
            'REST-API-BACKEND': createdExams[3]._id
        };

        // Attach examId, title, topic
        const allQuestions = [
            ...basicProgrammingQuestions.map((q, idx) => ({
                ...q,
                title: q.title || `Kiến thức cơ bản #${idx + 1}`,
                topic: q.topic || 'Lập trình cơ bản',
                examId: examMap['BASIC-PROGRAMMING']
            })),
            ...oopQuestions.map((q, idx) => ({
                ...q,
                title: q.title || `OOP & Design Patterns #${idx + 1}`,
                topic: q.topic || 'Hướng đối tượng',
                examId: examMap['OOP-ADVANCED']
            })),
            ...mysqlQuestions.map((q, idx) => ({
                ...q,
                title: q.title || `MySQL & Database #${idx + 1}`,
                topic: q.topic || 'Cơ sở dữ liệu',
                examId: examMap['MYSQL-DATABASE']
            })),
            ...restApiQuestions.map((q, idx) => ({
                ...q,
                title: q.title || `REST API & Backend #${idx + 1}`,
                topic: q.topic || 'REST API',
                examId: examMap['REST-API-BACKEND']
            }))
        ];

        await Question.insertMany(allQuestions);
        console.log(` Seeded ${allQuestions.length} questions across ${createdExams.length} exams successfully!`);
        process.exit();
    } catch (err) {
        console.error(' Error seeding data:', err);
        process.exit(1);
    }
};

seed();
