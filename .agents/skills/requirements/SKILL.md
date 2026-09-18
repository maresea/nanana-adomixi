---
name: requirements-engineering-skill
description: Quy chuẩn và quy trình phân tích, bóc tách và đặc tả yêu cầu phần mềm (SRS, User Stories, Gherkin Acceptance Criteria, Ma trận truy xuất nguồn gốc) cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Phân tích và Đặc tả Yêu cầu Phần mềm (Requirements Engineering)

## 1. Mục tiêu và Phạm vi Áp dụng

Skill này hướng dẫn quy chuẩn phân tích nghiệp vụ, bóc tách và viết tài liệu đặc tả yêu cầu cho dự án **"Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI"**.

### 1.1. Nguyên tắc cốt lõi:
- Bám sát phạm vi được xác định trong tài liệu dự án.
- Không tự ý tạo thêm chức năng ngoài phạm vi.
- Không biến yêu cầu thành thiết kế kỹ thuật nếu chưa cần thiết.
- Không tự quyết định framework, database, kiến trúc hoặc hạ tầng thay cho các Skill chuyên môn khác.
- Mọi yêu cầu mới phải được kiểm tra xem có thuộc phạm vi dự án hay là chức năng mở rộng.
- Ưu tiên yêu cầu đơn giản, rõ ràng, có thể kiểm thử và truy vết.
- Các kết quả AI mang tính hỗ trợ; người dùng vẫn kiểm tra và quyết định kết quả cuối cùng.

### 1.2. Baseline và Mở rộng Yêu cầu:
Skill phải sử dụng tài liệu dự án làm nguồn yêu cầu ban đầu.

Có thể:
- Bóc tách yêu cầu cấp cao thành các yêu cầu chi tiết.
- Bổ sung các yêu cầu chức năng cần thiết để hoàn thiện nghiệp vụ.
- Bổ sung các yêu cầu phi chức năng cần thiết cho bảo mật, hiệu năng, khả năng sử dụng, bảo trì và kiểm thử.
- Điều chỉnh mã FR/NFR khi cấu trúc yêu cầu thay đổi.

Mọi yêu cầu được bổ sung phải:
1. Có lý do nghiệp vụ hoặc kỹ thuật rõ ràng.
2. Không mâu thuẫn với phạm vi dự án.
3. Có thể kiểm thử.
4. Có thể truy vết về yêu cầu gốc hoặc ghi rõ là yêu cầu mở rộng.

> **Lưu ý quan trọng**: Không tự ý coi một yêu cầu mở rộng là yêu cầu bắt buộc của baseline nếu chưa được xác nhận.

---

## 2. Chuẩn hóa 3 Vai trò Người dùng (User Roles)

Hệ thống chỉ có 3 vai trò chính, không tự ý tạo thêm vai trò hoặc mở rộng mô hình phân quyền phức tạp:

| Vai trò | Người dùng | Trách nhiệm và quyền hạn chính |
|---|---|---|
| **Văn thư** | Nhân viên văn thư | Tiếp nhận công văn đến/đi, lưu trữ tệp, kiểm tra thông tin trích xuất, vào sổ công văn, chuyển trình lãnh đạo. Không phân công người khác. |
| **Lãnh đạo** | Trưởng/Phó đơn vị | Xem tóm tắt văn bản, phân công người xử lý, ấn định thời hạn xử lý, phê duyệt dự thảo công văn phản hồi, xem thống kê tiến độ. |
| **Chuyên viên** | Cán bộ thụ lý | Nhận văn bản được phân công, xem nội dung và ý kiến chỉ đạo, yêu cầu AI hỗ trợ sinh dự thảo phản hồi, chỉnh sửa dự thảo, cập nhật trạng thái và trình duyệt. |

---

## 3. Danh mục 12 Yêu cầu Chức năng (Functional Requirements - FR)

Mọi chức năng hệ thống bắt buộc phải thuộc danh mục 12 yêu cầu sau, mô tả thuần túy ở góc độ nghiệp vụ:

| Mã FR | Tên chức năng | Vai trò | Mục tiêu nghiệp vụ (Đầu vào ➔ Xử lý ➔ Đầu ra) | Mức ưu tiên |
|:---:|---|:---:|---|:---:|
| **FR1** | Đăng nhập và phân quyền | Chung | **Vào**: Tên đăng nhập, mật khẩu.<br>**Xử lý**: Xác thực người dùng và phân quyền theo đúng 3 vai trò (văn thư, lãnh đạo, chuyên viên).<br>**Ra**: Đăng nhập thành công, chỉ truy cập đúng các chức năng thuộc quyền. | `Must Have` |
| **FR2** | Quản lý công văn | Văn thư | **Vào**: Thông tin công văn đến/đi (số hiệu, ngày, trích yếu, nơi gửi/nhận) và tệp văn bản đính kèm.<br>**Xử lý**: Tiếp nhận, tạo mới, cập nhật và lưu trữ thông tin công văn cùng tệp văn bản ở mức demo.<br>**Ra**: Bản ghi công văn được lưu vào sổ, sẵn sàng luân chuyển. | `Must Have` |
| **FR3** | Phân công và theo dõi xử lý | Lãnh đạo | **Vào**: Công văn cần xử lý, người được phân công (chuyên viên), thời hạn xử lý, ý kiến chỉ đạo.<br>**Xử lý**: Ghi nhận phân công, thiết lập hạn xử lý và theo dõi tiến độ giải quyết văn bản.<br>**Ra**: Công văn được chuyển tới chuyên viên; hạn xử lý được theo dõi. | `Must Have` |
| **FR4** | Cập nhật trạng thái quản lý | Chuyên viên | **Vào**: Tiến độ thực tế, nội dung công văn phản hồi cần trình duyệt.<br>**Xử lý**: Cập nhật trạng thái xử lý (Đang xử lý, Hoàn thành...) và trình công văn phản hồi.<br>**Ra**: Trạng thái văn bản được cập nhật trên toàn hệ thống. | `Must Have` |
| **FR5** | Tra cứu văn bản | Chung | **Vào**: Tiêu chí tra cứu (số ký hiệu, ngày ban hành, đơn vị, trạng thái).<br>**Xử lý**: Tìm kiếm danh sách văn bản thỏa mãn điều kiện theo đúng quyền xem của người dùng.<br>**Ra**: Danh sách kết quả tra cứu phù hợp, rõ ràng. | `Must Have` |
| **FR6** | Nhắc hạn xử lý | Hệ thống | **Vào**: Thời hạn xử lý của các văn bản.<br>**Xử lý**: Tự động so sánh hạn xử lý với thời gian hiện tại để nhận biết trạng thái sắp đến hạn hoặc quá hạn.<br>**Ra**: Thông báo nhắc nhở trực quan cho người dùng liên quan. | `Must Have` |
| **FR7** | AI trích xuất thông tin | Văn thư / AI | **Vào**: Nội dung văn bản.<br>**Xử lý**: AI tự động trích xuất các thông tin quan trọng: số ký hiệu, ngày ban hành, cơ quan gửi và trích yếu.<br>**Ra**: Thông tin trích xuất gợi ý để văn thư kiểm tra, sửa đổi trước khi lưu. | `Must Have` |
| **FR8** | AI tóm tắt văn bản | Lãnh đạo / AI | **Vào**: Nội dung văn bản.<br>**Xử lý**: AI tạo bản tóm tắt ngắn gọn (3–5 ý chính), nêu rõ mục đích, yêu cầu và thời hạn xử lý.<br>**Ra**: Bản tóm tắt súc tích, chỉ dựa trên nội dung được cung cấp, không bịa thông tin. | `Must Have` |
| **FR9** | AI phân loại và gợi ý ưu tiên | Văn thư / AI | **Vào**: Nội dung văn bản.<br>**Xử lý**: AI phân tích nội dung để gợi ý nhóm/phân loại phù hợp và mức độ ưu tiên xử lý.<br>**Ra**: Gợi ý mang tính tham khảo; người dùng có quyền chỉnh sửa, không coi là quyết định tuyệt đối. | `Should Have` |
| **FR10** | AI sinh dự thảo phản hồi | Chuyên viên / AI | **Vào**: Nội dung văn bản gốc và ý kiến/chỉ đạo được cung cấp.<br>**Xử lý**: AI sinh dự thảo công văn phản hồi theo đúng biểu mẫu thể thức hành chính.<br>**Ra**: Bản dự thảo để chuyên viên xem xét, chỉnh sửa trước khi trình duyệt (không tự động gửi ra ngoài). | `Must Have` |
| **FR11** | Báo cáo thống kê | Lãnh đạo | **Vào**: Bộ lọc thời gian, đơn vị/phòng ban.<br>**Xử lý**: Thống kê số lượng công văn tiếp nhận, tình trạng xử lý (đúng hạn, quá hạn) theo cá nhân và phòng ban.<br>**Ra**: Bảng điều khiển (dashboard) thống kê đơn giản, dễ hiểu. | `Must Have` |
| **FR12** | Nhận dạng ký tự (OCR) | Văn thư | **Vào**: Tệp hình ảnh hoặc bản scan PDF của công văn.<br>**Xử lý**: Đọc và chuyển đổi tệp scan/hình ảnh thành văn bản thô (text) ở mức đơn giản.<br>**Ra**: Dữ liệu văn bản thô để phục vụ lưu trữ và đưa cho AI xử lý. | `Should Have` |

---

## 4. Đặc tả Tiêu chuẩn 9 Yêu cầu Phi chức năng (NFR Baseline)

Tập trung vào yêu cầu chất lượng phần mềm ở góc độ nghiệp vụ, không áp đặt giải pháp kiến trúc hay công nghệ:

- **NFR1. Bảo mật và phân quyền**: Hệ thống phải kiểm soát quyền truy cập theo vai trò, phòng ban và nhiệm vụ được phân công, đảm bảo người dùng chỉ truy cập được những tài liệu mà họ có quyền.
- **NFR2. Khả năng tích hợp AI**: Hệ thống phải cho phép sử dụng mô hình AI nội bộ hoặc dịch vụ AI bên ngoài tùy theo yêu cầu về bảo mật và triển khai.
- **NFR3. Hiệu năng xử lý**: Các tác vụ có thời gian xử lý dài như phân tích văn bản hoặc gọi AI phải được xử lý bất đồng bộ, không làm gián đoạn giao diện.
- **NFR4. Thời gian phản hồi**: Các thao tác thông thường trên hệ thống phải có thời gian phản hồi nhanh và không gây gián đoạn trải nghiệm người dùng.
- **NFR5. Khả năng sử dụng**: Giao diện phải đơn giản, dễ sử dụng và phù hợp với các thiết bị phổ biến như máy tính và máy tính bảng.
- **NFR6. Khả năng bảo trì và mở rộng**: Frontend và Backend được tách biệt, giao tiếp thông qua API để thuận tiện cho việc bảo trì và mở rộng hệ thống.
- **NFR7. Khả năng thay đổi mô hình AI**: Các thành phần AI phải được thiết kế độc lập với logic nghiệp vụ, cho phép thay đổi mô hình hoặc nhà cung cấp AI mà không ảnh hưởng đáng kể đến các chức năng cốt lõi.
- **NFR8. Giới hạn phần cứng**: Các mô hình AI nội bộ (Local AI) phải được tối ưu hóa để vận hành ổn định trên hạ tầng máy chủ hiện có của cơ quan, đảm bảo không yêu cầu kết nối Internet đối với các văn bản mật.
- **NFR9. Độ chính xác**: Chức năng AI trích xuất thông tin văn bản phải đảm bảo độ chính xác đạt tối thiểu 90-95% để giảm thiểu thời gian đối soát thủ công.

---

## 5. Quy chuẩn viết User Story & Tiêu chí Chấp nhận (Gherkin AC)

User Story cần đơn giản, phản ánh đúng mong đợi của người dùng và có tiêu chí chấp nhận cụ thể:

### Mẫu cấu trúc User Story:
```markdown
### US-[MÃ_FR]: [Tiêu đề kịch bản người dùng]
- **Mô tả (Narrative)**: 
  - Là một **[Văn thư | Lãnh đạo | Chuyên viên]**,
  - Tôi muốn **[Hành động thao tác cần làm]**,
  - Để **[Mục đích mang lại cho công việc]**.
- **Yêu cầu liên kết**: [Mã FR tương ứng: FR1 - FR12]
- **Tiêu chí chấp nhận (Acceptance Criteria - Gherkin)**:
  - **Kịch bản 1: Thao tác hợp lệ (Happy Path)**
    - *Given (Bối cảnh)*: Người dùng đã đăng nhập với đúng vai trò và ở giao diện chức năng.
    - *When (Thao tác)*: Người dùng nhập đầy đủ dữ liệu hợp lệ và bấm xác nhận.
    - *Then (Kết quả)*: Hệ thống lưu dữ liệu thành công, cập nhật trạng thái và phản hồi rõ ràng.
  - **Kịch bản 2: Ngoại lệ hoặc từ chối truy cập (Exception/Edge Case)**
    - *Given*: Người dùng cố tình thao tác trên văn bản ngoài quyền hạn hoặc nhập thiếu dữ liệu bắt buộc.
    - *When*: Người dùng kích hoạt thao tác.
    - *Then*: Hệ thống từ chối thực hiện, giữ nguyên trạng thái cũ và hiển thị thông báo lỗi phù hợp.
```

---

## 6. Ma trận Truy xuất Nguồn gốc Yêu cầu (Traceability Matrix)

Ma trận ở tầng Yêu cầu chỉ liên kết giữa **Mục tiêu nghiệp vụ (FR) ➔ Ràng buộc chất lượng (NFR) ➔ Vai trò phụ trách ➔ Tiêu chí nghiệm thu cốt lõi**, tuyệt đối không đưa tên bảng CSDL hay API endpoint kỹ thuật vào đây:

| Mã FR | Tên chức năng | NFR áp dụng | Vai trò chịu trách nhiệm | Tiêu chí nghiệm thu cốt lõi |
|:---:|---|:---:|:---:|---|
| **FR1** | Đăng nhập & phân quyền | NFR1, NFR4 | Toàn hệ thống | Đăng nhập đúng vai trò (Văn thư/Lãnh đạo/Chuyên viên); kiểm soát quyền chặt chẽ. |
| **FR2** | Quản lý công văn | NFR1, NFR6 | Văn thư | Tiếp nhận, tạo lập, lưu trữ công văn đến/đi và tệp đính kèm ở mức demo. |
| **FR3** | Phân công & theo dõi xử lý | NFR1, NFR4 | Lãnh đạo | Phân công đúng người, định rõ hạn xử lý, theo dõi được tiến độ của văn bản. |
| **FR4** | Cập nhật trạng thái quản lý | NFR1, NFR4 | Chuyên viên | Cập nhật tiến độ giải quyết công việc và trình được công văn phản hồi. |
| **FR5** | Tra cứu văn bản | NFR1, NFR4 | Chung | Tìm kiếm chính xác theo số ký hiệu, ngày, đơn vị, trạng thái trong phạm vi được phép xem. |
| **FR6** | Nhắc hạn xử lý | NFR1, NFR4 | Hệ thống | Tự động phát hiện và cảnh báo văn bản sắp đến hạn hoặc quá hạn xử lý. |
| **FR7** | AI trích xuất thông tin | NFR2, NFR7, NFR9 | Văn thư / AI | Trích xuất đủ số hiệu, ngày, cơ quan gửi, trích yếu; người dùng kiểm tra và sửa được. |
| **FR8** | AI tóm tắt văn bản | NFR2, NFR7 | Lãnh đạo / AI | Tạo bản tóm tắt 3–5 ý chính (mục đích, yêu cầu, thời hạn); không bịa thông tin. |
| **FR9** | AI phân loại & gợi ý ưu tiên | NFR2, NFR7 | Văn thư / AI | Gợi ý nhóm văn bản và mức ưu tiên; người dùng có toàn quyền điều chỉnh. |
| **FR10** | AI sinh dự thảo phản hồi | NFR2, NFR7 | Chuyên viên / AI | Sinh dự thảo dựa trên chỉ đạo và nội dung gốc theo mẫu hành chính; người dùng phải duyệt trước khi gửi. |
| **FR11** | Báo cáo thống kê | NFR4, NFR5 | Lãnh đạo | Bảng điều khiển trực quan hiển thị số lượng văn bản, tình trạng đúng/quá hạn theo phòng ban và cá nhân. |
| **FR12** | Nhận dạng ký tự (OCR) | NFR3, NFR8 | Văn thư | Chuyển đổi tệp ảnh/scan PDF thành văn bản thô để lưu trữ và đưa AI xử lý. |

---

## 7. Checklist Kiểm tra Tuân thủ Chuẩn Yêu cầu (Scope & Anti-Overengineering)

Mỗi khi rà soát hoặc viết tài liệu đặc tả yêu cầu, bắt buộc đối chiếu checklist:

- [ ] **Đúng phạm vi**: Chức năng có nằm trong danh mục FR1 - FR12 không? Nếu không, phải cảnh báo đây là tính năng mở rộng ngoài phạm vi.
- [ ] **Không over-engineering**: Yêu cầu có thuần túy mô tả nghiệp vụ không? Đã loại bỏ hoàn toàn các khái niệm kỹ thuật phức tạp (Message Queue, Vector DB, ABAC phức tạp...) chưa?
- [ ] **Không lấn sân kỹ thuật**: Yêu cầu có để ngỏ quyền quyết định công nghệ (framework, ORM, cấu trúc database, API routes) cho các Skill chuyên môn tương ứng không?
- [ ] **Đúng 3 vai trò**: Chức năng có được gán rõ ràng cho Văn thư, Lãnh đạo hoặc Chuyên viên không? Không tự ý sinh thêm vai trò mới.
- [ ] **AI mang tính hỗ trợ**: Kết quả AI có được định nghĩa là công cụ gợi ý, dự thảo và trao quyền quyết định, kiểm tra cuối cùng cho người dùng không?
