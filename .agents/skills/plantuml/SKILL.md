---
name: plantuml-diagram-skill
description: Quy chuẩn và quy trình vẽ biểu đồ bằng PlantUML (Sequence Diagram, Activity Diagram, Use Case Diagram, Class Diagram).
---

# Skill: Vẽ Biểu đồ UML (Sequence, Activity, Use Case, Class) bằng PlantUML

## 1. Mục tiêu

Skill này hướng dẫn tạo các biểu đồ UML gồm **Sequence Diagram (Biểu đồ tuần tự)**, **Activity Diagram (Biểu đồ hoạt động)**, **Use Case Diagram (Biểu đồ ca sử dụng)** và **Class Diagram (Biểu đồ lớp)** bằng **PlantUML** theo phong cách:

- Đẹp, sạch, dễ đọc.
- Bố cục khoa học, hạn chế đường giao nhau.
- Màu sắc nhẹ, chuyên nghiệp, phù hợp tài liệu môn học/đồ án.
- Tên thành phần ngắn gọn, nhất quán.
- Có thể copy trực tiếp vào PlantUML/VS Code/IntelliJ/Markdown có hỗ trợ PlantUML.

---

## 2. Nguyên tắc thiết kế chung

### 2.1. Phong cách hình ảnh

Ưu tiên phong cách **modern / academic / minimal**:

```plantuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 12
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam ArrowColor #4B5563
skinparam ArrowThickness 1.2
skinparam NoteBackgroundColor #FFFBEA
skinparam NoteBorderColor #E5C76B
```

### 2.2. Quy tắc màu

Không dùng quá nhiều màu. Chỉ nên có 3–5 màu chính:

| Thành phần | Màu gợi ý |
|---|---|
| Actor | `#E8F0FE` |
| Giao diện | `#E8F7F0` |
| Backend / Service | `#F3E8FF` |
| Database | `#FFF4E5` |
| AI Service | `#FDECEC` |
| Ghi chú | `#FFFBEA` |

Có thể thay đổi màu nhưng phải giữ độ tương phản tốt.

### 2.3. Quy tắc bố cục

1. Đọc từ **trên xuống dưới** và **trái sang phải**.
2. Actor đặt ngoài cùng bên trái/phải.
3. Thành phần chính đặt ở giữa.
4. Database thường nằm cuối luồng hoặc phía bên phải.
5. AI Service nên nằm gần Backend nếu AI được gọi nội bộ.
6. Tránh hơn 6–8 participant trong một sequence diagram. Nếu quá nhiều, tách thành biểu đồ nhỏ hơn.
7. Với activity diagram, dùng `partition` để chia theo vai trò hoặc module khi luồng phức tạp.

---

# 3. Skill: Sequence Diagram

## 3.1. Khi nào sử dụng

Dùng Sequence Diagram để mô tả:

- Ai tương tác với hệ thống.
- Các đối tượng gọi nhau theo thứ tự nào.
- Request/response giữa Frontend, Backend, Database, AI.
- Luồng thành công và ngoại lệ.

Không nên dùng Sequence Diagram để mô tả toàn bộ nghiệp vụ quá dài. Mỗi biểu đồ nên tập trung vào **một use case chính**.

---

## 3.2. Cấu trúc participant nên ưu tiên

Thông thường dùng:

```text
Actor → Boundary/UI → Control/Service → AI Service → Database
```

Ví dụ:

```text
Nhân viên văn thư
      ↓
Giao diện quản lý công văn
      ↓
Document Service
      ↓
AI Service
      ↓
Database
```

---

## 3.3. Template Sequence Diagram đẹp

```plantuml
@startuml
' =========================
' THEME
' =========================
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 12
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam sequence {
    ArrowColor #4B5563
    ArrowThickness 1.2
    LifeLineBorderColor #9CA3AF
    LifeLineBackgroundColor #F9FAFB
    ParticipantBorderColor #64748B
    ParticipantBackgroundColor #F8FAFC
    ParticipantFontColor #1F2937
    ActorBorderColor #64748B
    ActorBackgroundColor #E8F0FE
    ActorFontColor #1F2937
    GroupBorderColor #CBD5E1
    GroupBackgroundColor #F8FAFC
    BoxBorderColor #CBD5E1
    BoxPadding 8
    MessageAlign center
    ResponseMessageBelowArrow true
}

' =========================
' TITLE
' =========================
title <TÊN USE CASE>

' =========================
' PARTICIPANTS
' =========================
actor "<Actor>" as Actor
boundary "<Giao diện>" as UI
control "<Service / Backend>" as Service
control "<AI Service>" as AI
entity "<Database>" as DB

' =========================
' MAIN FLOW
' =========================
Actor -> UI : <1. Thực hiện thao tác>
activate UI

UI -> Service : <2. Gửi yêu cầu>
activate Service

Service -> DB : <3. Kiểm tra / lấy dữ liệu>
activate DB
DB --> Service : <4. Dữ liệu>
deactivate DB

Service -> AI : <5. Phân tích / xử lý AI>
activate AI
AI --> Service : <6. Kết quả AI>
deactivate AI

Service --> UI : <7. Trả kết quả>
deactivate Service

UI --> Actor : <8. Hiển thị kết quả>
deactivate UI

' =========================
' EXCEPTION / ALTERNATIVE
' =========================
alt <Điều kiện ngoại lệ>
    UI --> Actor : <Thông báo lỗi>
else <Điều kiện khác>
    UI --> Actor : <Thông báo phù hợp>
end

@enduml
```

---

## 3.4. Quy tắc viết message

Ưu tiên message ngắn:

```text
Gửi yêu cầu
Kiểm tra dữ liệu
Lưu công văn
Phân tích nội dung
Đề xuất đơn vị xử lý
Trả kết quả
Hiển thị thông báo
```

Không nên viết:

```text
Hệ thống thực hiện việc kiểm tra toàn bộ thông tin của công văn được người dùng nhập vào trước khi tiến hành lưu dữ liệu...
```

Thay bằng:

```text
Kiểm tra dữ liệu công văn
```

---

## 3.5. Dùng nhóm `alt / opt / loop`

### Điều kiện rẽ nhánh

```plantuml
alt Dữ liệu hợp lệ
    Service --> UI : Trả kết quả
else Dữ liệu không hợp lệ
    Service --> UI : Thông báo lỗi
end
```

### Bước tùy chọn

```plantuml
opt Người dùng yêu cầu AI tóm tắt
    Service -> AI : Tóm tắt văn bản
    AI --> Service : Bản tóm tắt
end
```

### Lặp

```plantuml
loop Với từng tài liệu đính kèm
    Service -> AI : Phân tích tài liệu
    AI --> Service : Kết quả
end
```

---

## 3.6. Dùng `note` đúng cách

```plantuml
note right of AI
AI chỉ đưa ra kết quả
đề xuất; người dùng có
quyền kiểm tra và điều chỉnh.
end note
```

Chỉ dùng note khi cần giải thích quy tắc nghiệp vụ hoặc đặc điểm AI.

---

# 4. Skill: Activity Diagram

## 4.1. Khi nào sử dụng

Dùng Activity Diagram để mô tả:

- Quy trình nghiệp vụ.
- Các bước xử lý từ đầu đến cuối.
- Rẽ nhánh điều kiện.
- Các bước song song.
- Điểm bắt đầu/kết thúc.
- Phân chia trách nhiệm giữa các vai trò.

Activity Diagram nên tập trung vào **workflow**, không mô tả chi tiết request/response giữa từng API.

---

## 4.2. Template Activity Diagram đẹp

```plantuml
@startuml
' =========================
' THEME
' =========================
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 16
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam activity {
    BackgroundColor #F8FAFC
    BorderColor #64748B
    FontColor #1F2937
    DiamondBackgroundColor #FFF4E5
    DiamondBorderColor #D97706
    StartColor #475569
    EndColor #475569
    BarColor #64748B
    ArrowColor #4B5563
    ArrowThickness 1.2
}

' =========================
' TITLE
' =========================
title <TÊN QUY TRÌNH>

' =========================
' FLOW
' =========================
start

:<Bước 1>;
:<Bước 2>;

if (<Điều kiện?>) then (Có)
    :<Xử lý nhánh Có>;
else (Không)
    :<Xử lý nhánh Không>;
endif

:<Bước tiếp theo>;

stop
@enduml
```

---

## 4.3. Activity Diagram có phân vai trò

Khi có nhiều actor, ưu tiên `partition`:

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 16
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam activity {
    BackgroundColor #F8FAFC
    BorderColor #64748B
    FontColor #1F2937
    DiamondBackgroundColor #FFF4E5
    DiamondBorderColor #D97706
    StartColor #475569
    EndColor #475569
    BarColor #64748B
    ArrowColor #4B5563
}

title Quy trình tiếp nhận và xử lý công văn

start

partition "Văn thư" {
    :Tiếp nhận công văn;
    :Tải file công văn;
}

partition "Hệ thống" {
    :Trích xuất thông tin;
    :Kiểm tra dữ liệu;
}

if (Dữ liệu hợp lệ?) then (Có)

    partition "AI" {
        :Phân tích nội dung;
        :Đề xuất đơn vị xử lý;
        :Tóm tắt văn bản;
    }

    partition "Lãnh đạo" {
        :Xem tóm tắt;
        :Chọn đơn vị / người xử lý;
        :Thiết lập hạn xử lý;
    }

    partition "Chuyên viên" {
        :Tiếp nhận nhiệm vụ;
        :Xử lý công văn;
        :Cập nhật trạng thái;
    }

else (Không)
    partition "Hệ thống" {
        :Hiển thị lỗi;
        :Yêu cầu nhập lại / bổ sung dữ liệu;
    }
endif

stop
@enduml
```

# 5. Skill: Class Diagram (Biểu đồ Lớp)

## 5.1. Khi nào sử dụng
Dùng Class Diagram để mô tả:
- Cấu trúc tĩnh của hệ thống phần mềm hướng đối tượng.
- Danh mục các lớp thực thể (Entities), lớp dịch vụ (Services), lớp điều khiển (Controllers/Routers) và đối tượng truyền tải (DTO/Schemas).
- Thuộc tính (Attributes) kèm phạm vi truy cập (`+`, `-`, `#`), kiểu dữ liệu và các phương thức (Methods) cốt lõi.
- Các mối quan hệ tĩnh giữa các lớp: Sở hữu chặt chẽ (Composition), Thu nạp (Aggregation), Liên kết (Association), Kế thừa (Inheritance) và Phụ thuộc (Dependency).

Không nên dùng Class Diagram để nhồi nhét tất cả các hàm getter/setter hoặc mọi chi tiết nhỏ của database. Biểu đồ phải tập trung vào **ngữ nghĩa nghiệp vụ và cấu trúc phần mềm**.

---

## 5.2. Cấu trúc phân loại lớp nên ưu tiên

Trong kiến trúc hướng đối tượng cho hệ thống quản lý công văn, ưu tiên phân tầng rõ rệt:

```text
Controller / Router (Giao tiếp API)
        ↓  <<calls>>
Service / Control (Xử lý nghiệp vụ & Điều phối AI)
        ↓  <<manages>>
Entity / Model (Dữ liệu thực thể lưu trữ)
```

- `<<Entity>>`: Đại diện cho đối tượng lưu trữ thông tin (`User`, `Document`, `Attachment`, `TaskAssignment`).
- `<<Service>>`: Chứa logic nghiệp vụ và gọi mô hình AI (`DocumentService`, `AIService`, `TaskService`).
- `<<Controller>>` hoặc `<<Router>>`: Điểm tiếp nhận request từ giao diện.
- `<<DTO>>`: Cấu trúc dữ liệu trao đổi hoặc kết quả AI trả về (`MetadataDTO`, `SummaryDTO`).

---

## 5.3. Phong cách hình ảnh & Skinparam chuẩn cho Class Diagram
Ưu tiên phong cách tối giản, học thuật, tắt các biểu tượng icon tròn mặc định của PlantUML (`classAttributeIconSize 0`) và bo góc nhẹ:

```plantuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 8
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #F8FAFC
    BorderColor #475569
    ArrowColor #334155
    HeaderBackgroundColor #E2E8F0
}

skinparam package {
    BackgroundColor #FAFAFA
    BorderColor #94A3B8
    FontColor #0F172A
    FontStyle bold
}
```

---

## 5.4. Quy ước ký hiệu quan hệ chuẩn UML trong PlantUML

| Quan hệ | Ý nghĩa & Bản chất | Cú pháp PlantUML | Ví dụ trong Quản lý công văn |
|---|---|:---:|---|
| **Inheritance** | Kế thừa / Khái quát hóa | `<|--` | `BaseUser <|-- Clerk` |
| **Realization** | Hiện thực hóa Interface | `<|..` | `IAIService <|.. LocalAIService` |
| **Composition** | Sở hữu chặt (Nếu cha bị xoá, con bị xoá theo) | `*--` | `Document "1" *-- "1..*" Attachment` *(Xoá công văn thì xoá tệp đính kèm)* |
| **Aggregation** | Thu nạp (Tồn tại độc lập) | `o--` | `Department "1" o-- "0..*" User` *(Phòng ban giải thể, người dùng vẫn tồn tại)* |
| **Association** | Liên kết thông thường có chỉ số bội | `-->` hoặc `--` | `User "1" --> "0..*" TaskAssignment : "giao/nhận"` |
| **Dependency** | Phụ thuộc sử dụng tạm thời | `..>` | `DocumentService ..> AIService : "gọi bóc tách/tóm tắt"` |

---

## 5.5. Quy tắc viết Thuộc tính và Phương thức

- **Phạm vi truy cập (Visibility)**:
  - `-` : `Private` (dùng cho hầu hết thuộc tính dữ liệu).
  - `+` : `Public` (dùng cho các phương thức nghiệp vụ).
  - `#` : `Protected` (dùng cho lớp cha kế thừa).
- **Cú pháp**:
  - Thuộc tính: `<visibility> <tên_thuộc_tính>: <kiểu_dữ_liệu>` (Ví dụ: `- document_number: str`, `- deadline: datetime`).
  - Phương thức: `<visibility> <tên_phương_thức>(<tham_số>: <kiểu>): <kiểu_trả_về>` (Ví dụ: `+ update_status(new_status: str): void`).
- **Ngắn gọn & Đúng nghiệp vụ**: Không đưa các hàm phụ trợ linh tinh (như getter, setter, toString) vào sơ đồ để tránh rối mắt.

---

## 5.6. Dùng `package` để phân nhóm module

Khi số lượng lớp trên 6 lớp, bắt buộc dùng `package` để gom nhóm:

```plantuml
package "Quản lý Người dùng & Phân quyền" {
    class User
    class Role
    class Department
}

package "Nghiệp vụ Công văn & Tệp" {
    class Document
    class Attachment
}
```

---

## 5.7. Template Class Diagram chuẩn đẹp

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 8
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #F8FAFC
    BorderColor #475569
    ArrowColor #334155
    HeaderBackgroundColor #E2E8F0
}

' Lớp AI được tô màu nhận diện riêng
class AIService <<Service>> #FEF2F2 {
    + extract_metadata(document_text: str): MetadataDTO
    + summarize_text(document_text: str): str
    + generate_draft(original_text: str, instruction: str): str
}

class Document {
    - id: int
    - document_number: str
    - title: str
    - deadline: datetime
    + add_attachment(file: Attachment): void
    + update_status(new_status: str): void
    + is_overdue(): bool
}

class Attachment {
    - id: int
    - file_name: str
    - file_path: str
    - file_size: int
}

' Quan hệ
Document "1" *-- "1..*" Attachment : "chứa tệp"
Document ..> AIService : "gọi xử lý"

@enduml
```

---

# 6. Cách làm biểu đồ dễ nhìn hơn

## 6.1. Sequence Diagram

Nên:
- Giới hạn 5–7 participant.
- Chia luồng thành `group`, `alt`, `opt`, `loop`.
- `activate/deactivate` cho service chính.
- Message có đánh số nếu biểu đồ phục vụ thuyết trình.
- Đặt Database ở gần cuối luồng.
- AI đứng cạnh Backend, không đặt giữa Actor và UI nếu không cần.

Ví dụ:

```plantuml
group Xử lý chính
    Service -> DB : Lấy dữ liệu
    DB --> Service : Dữ liệu

    Service -> AI : Phân tích nội dung
    AI --> Service : Kết quả
end
```

## 6.2. Activity Diagram

Nên:
- Một luồng chính rõ ràng.
- Mỗi action chỉ chứa một hành động.
- Điều kiện viết dưới dạng câu hỏi.
- Nhánh `Có/Không` rõ ràng.
- Dùng `partition` khi muốn cho thấy trách nhiệm của Actor.
- Không nhồi quá nhiều chữ vào mỗi node.

## 6.3. Class Diagram

Nên:
- **Giới hạn số lượng lớp**: Tối đa 7–10 lớp trong một sơ đồ tổng quan. Nếu hệ thống lớn, tách thành: *Mô hình lớp miền (Domain)*, *Mô hình lớp phân hệ Quản lý công văn*, *Mô hình lớp phân hệ Phân công & AI*.
- **Hạn chế đường giao nhau**: Sắp xếp lớp cha ở trên, lớp con ở dưới; Service ở trên, Entity ở dưới; tránh kéo các đường liên kết cắt chéo nhau.
- **Dùng package**: Nhóm các thực thể có liên quan mật thiết vào chung một khối hình chữ nhật (`package`).
- **Ghi rõ chỉ số bội (Multiplicity)**: Luôn ghi rõ `1`, `0..*`, `1..*` ở hai đầu quan hệ để người đọc nắm được quy tắc nghiệp vụ (ví dụ: 1 công văn chứa 1..* tệp đính kèm).
- **Phân màu lớp AI**: Sử dụng màu nền pastel riêng (như `#FEF2F2`) cho `AIService` để làm nổi bật tính năng công nghệ của đề tài.

---

# 7. Template dành riêng cho hệ thống quản lý công văn tích hợp AI

## 6.1. Sequence: AI đề xuất đơn vị xử lý

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 12
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam sequence {
    ArrowColor #4B5563
    ArrowThickness 1.2
    LifeLineBorderColor #9CA3AF
    LifeLineBackgroundColor #F9FAFB
    ParticipantBorderColor #64748B
    ParticipantBackgroundColor #F8FAFC
    ParticipantFontColor #1F2937
    ActorBackgroundColor #E8F0FE
    ActorBorderColor #64748B
    GroupBackgroundColor #F8FAFC
    GroupBorderColor #CBD5E1
}

title AI đề xuất đơn vị xử lý công văn

actor "Văn thư" as Clerk
boundary "Giao diện công văn" as UI
control "Document Service" as Service
control "AI Service" as AI
entity "Database" as DB

Clerk -> UI : Tải công văn
activate UI

UI -> Service : Gửi file
activate Service

Service -> DB : Lưu file & thông tin ban đầu
DB --> Service : Đã lưu

Service -> AI : Phân tích nội dung
activate AI
AI --> Service : Đề xuất đơn vị xử lý
          + mức độ ưu tiên
          + tóm tắt
 deactivate AI

Service --> UI : Trả kết quả đề xuất
deactivate Service

UI --> Clerk : Hiển thị kết quả AI
deactivate UI

note right of AI
AI chỉ đưa ra đề xuất.
Văn thư / lãnh đạo có thể
kiểm tra và điều chỉnh.
end note

@enduml
```

---

## 6.2. Activity: Tiếp nhận và phân công công văn

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 16
skinparam defaultFontName Arial
skinparam defaultFontSize 14
skinparam activity {
    BackgroundColor #F8FAFC
    BorderColor #64748B
    FontColor #1F2937
    DiamondBackgroundColor #FFF4E5
    DiamondBorderColor #D97706
    StartColor #475569
    EndColor #475569
    BarColor #64748B
    ArrowColor #4B5563
    ArrowThickness 1.2
}

title Quy trình tiếp nhận và phân công công văn

start

partition "Văn thư" {
    :Tiếp nhận công văn;
    :Tải file lên hệ thống;
}

partition "Hệ thống" {
    :Trích xuất thông tin công văn;
    :Kiểm tra dữ liệu;
}

if (Dữ liệu hợp lệ?) then (Có)

    partition "AI" {
        :Phân tích nội dung;
        :Tóm tắt văn bản;
        :Đề xuất đơn vị xử lý;
        :Đề xuất mức độ ưu tiên;
    }

    partition "Lãnh đạo" {
        :Xem kết quả AI;
        :Chọn đơn vị / người xử lý;
        :Nhập ý kiến chỉ đạo;
        :Thiết lập hạn xử lý;
    }

    partition "Hệ thống" {
        :Lưu quyết định phân công;
        :Gửi thông báo nhiệm vụ;
    }

    partition "Chuyên viên" {
        :Tiếp nhận nhiệm vụ;
        :Xử lý công văn;
        :Cập nhật trạng thái;
    }

    if (Đã hoàn thành?) then (Có)
        partition "Hệ thống" {
            :Cập nhật trạng thái hoàn thành;
        }
        stop
    else (Chưa)
        :Tiếp tục xử lý;
    endif

else (Không)
    partition "Hệ thống" {
        :Hiển thị lỗi;
        :Yêu cầu bổ sung dữ liệu;
    }
endif

stop
@enduml
```

---

## 7.3. Class Diagram: Mô hình lớp thực thể cốt lõi cho Hệ thống Quản lý Công văn tích hợp AI

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam RoundCorner 8
skinparam defaultFontName Arial
skinparam defaultFontSize 13
skinparam classAttributeIconSize 0

skinparam class {
    BackgroundColor #F8FAFC
    BorderColor #475569
    ArrowColor #334155
    HeaderBackgroundColor #E2E8F0
}

skinparam package {
    BackgroundColor #FAFAFA
    BorderColor #94A3B8
    FontColor #0F172A
    FontStyle bold
}

' Lớp AI được tô màu nhận diện riêng
class AIService <<Service>> #FEF2F2 {
    + extract_metadata(document_text: str): MetadataDTO
    + summarize_text(document_text: str): str
    + suggest_classification(document_text: str): ClassificationDTO
    + generate_draft(original_text: str, instruction: str): str
    + perform_ocr(file_bytes: bytes): str
}

package "Quản lý Người dùng & Cơ quan" {
    class Department {
        - id: int
        - code: str
        - name: str
        + get_members(): List<User>
    }

    class Role {
        - id: int
        - code: str
        - name: str
    }

    class User {
        - id: int
        - username: str
        - full_name: str
        - email: str
        - is_active: bool
        + authenticate(password: str): bool
        + has_role(role_code: str): bool
    }
}

package "Nghiệp vụ Công văn & Tệp đính kèm" {
    class Document {
        - id: int
        - document_number: str
        - title: str
        - document_type: str
        - issued_date: date
        - urgency: str
        - status: str
        - ai_summary: str
        - deadline: datetime
        + add_attachment(file: Attachment): void
        + update_status(new_status: str): void
        + is_overdue(): bool
    }

    class Attachment {
        - id: int
        - file_name: str
        - file_path: str
        - file_size: int
        - extracted_text: str
    }
}

package "Phân công, Phản hồi & Cảnh báo" {
    class TaskAssignment {
        - id: int
        - instruction: str
        - deadline: datetime
        - status: str
        - created_at: datetime
        + update_status(new_status: str): void
        + is_deadline_near(): bool
    }

    class DraftResponse {
        - id: int
        - content: str
        - is_ai_generated: bool
        - is_approved: bool
        - approval_note: str
        + edit_content(text: str): void
        + approve(leader_id: int): void
        + reject(leader_id: int, reason: str): void
    }

    class Notification {
        - id: int
        - title: str
        - message: str
        - is_read: bool
        - created_at: datetime
        + mark_as_read(): void
    }
}

' --- Quan hệ giữa các lớp ---
Department "1" o-- "0..*" User : "chứa"
Role "1" <-- "0..*" User : "gán vai trò"

User "1" --> "0..*" Document : "tiếp nhận/tạo"
Document "1" *-- "1..*" Attachment : "chứa tệp"

Document "1" o-- "0..*" TaskAssignment : "được phân công"
User "1" --> "0..*" TaskAssignment : "lãnh đạo giao"
User "1" --> "0..*" TaskAssignment : "chuyên viên nhận"

TaskAssignment "1" *-- "0..*" DraftResponse : "sinh dự thảo"
User "1" --> "0..*" DraftResponse : "soạn thảo"

User "1" --> "0..*" Notification : "nhận cảnh báo"
Document "1" <-- "0..*" Notification : "liên quan"

Document ..> AIService : "gọi bóc tách/tóm tắt"
DraftResponse ..> AIService : "sinh nội dung"
Attachment ..> AIService : "bóc tách OCR"

@enduml
```

---

# 8. Checklist trước khi xuất biểu đồ

## Class Diagram
- [ ] Đã tắt icon tròn mặc định (`classAttributeIconSize 0`).
- [ ] Thuộc tính và phương thức có đầy đủ phạm vi truy cập (+, -, #).
- [ ] Phân biệt đúng giữa Composition (*--), Aggregation (o--), Association (-->).
- [ ] Không nhồi nhét quá nhiều chi tiết làm rối biểu đồ.

## Sequence Diagram

- [ ] Có Actor chính.
- [ ] Có UI/Boundary.
- [ ] Có Service/Control.
- [ ] Database chỉ xuất hiện khi thực sự có thao tác dữ liệu.
- [ ] AI được thể hiện riêng nếu use case có AI.
- [ ] Có thứ tự message rõ ràng.
- [ ] Có `alt/opt/loop` nếu có rẽ nhánh hoặc lặp.
- [ ] Không quá nhiều participant.
- [ ] Không dùng message quá dài.

## Activity Diagram

- [ ] Có `start`.
- [ ] Có `stop`.
- [ ] Các action viết ngắn.
- [ ] Điều kiện được đặt ở diamond.
- [ ] Nhánh Có/Không rõ ràng.
- [ ] Dùng `partition` nếu có nhiều vai trò.
- [ ] Không đưa chi tiết API/request-response vào activity.
- [ ] Luồng chính dễ theo dõi từ trên xuống dưới.

---

# 9. Prompt nội bộ để AI tự sinh PlantUML

Khi được yêu cầu tạo Sequence Diagram:

```text
Hãy tạo Sequence Diagram bằng PlantUML.
Ưu tiên bố cục từ trái sang phải, nền trắng, shadowing false,
font Arial, màu pastel nhẹ, RoundCorner 12.
Tối đa 5–7 participant.
Actor đặt bên ngoài, UI/Boundary ở giữa Actor và Backend,
Database gần cuối, AI Service đặt cạnh Backend.
Dùng activate/deactivate, alt/opt/loop khi cần.
Tên message ngắn gọn, mang tính nghiệp vụ.
Không tạo participant thừa.
Chỉ trả về một block @startuml ... @enduml.
```

Khi được yêu cầu tạo Activity Diagram:

```text
Hãy tạo Activity Diagram bằng PlantUML.
Ưu tiên flow từ trên xuống dưới, nền trắng, shadowing false,
font Arial, RoundCorner 16, màu pastel nhẹ.
Mỗi action chỉ mô tả một hành động.
Điều kiện phải là câu hỏi rõ ràng.
Dùng partition để phân biệt Actor/Module khi cần.
Không đưa chi tiết API hoặc database nếu chúng không quan trọng với workflow.
Luồng chính phải nổi bật, nhánh ngoại lệ rõ ràng.
Chỉ trả về một block @startuml ... @enduml.
```

Khi được yêu cầu tạo Class Diagram:

```text
Hãy tạo Class Diagram bằng PlantUML.
Ưu tiên bố cục gọn gàng, nền trắng, shadowing false,
font Arial, RoundCorner 8, màu pastel nhẹ, classAttributeIconSize 0.
Sắp xếp các lớp theo package module rõ ràng.
Hiển thị thuộc tính kèm phạm vi truy cập (+, -) và kiểu dữ liệu.
Hiển thị các phương thức nghiệp vụ cốt lõi kèm kiểu trả về.
Dùng đúng ký hiệu quan hệ UML: Composition (*--), Aggregation (o--), Association (-->), Dependency (..>).
Luôn ghi rõ chỉ số bội (1, 0..*, 1..*) ở hai đầu quan hệ.
Tô màu nền riêng (#FEF2F2) cho các lớp dịch vụ AI.
Chỉ trả về một block @startuml ... @enduml.
```

---

# 10. Quy ước đặt tên đề xuất

| Loại | Quy ước |
|---|---|
| Actor | Tên vai trò: `Văn thư`, `Lãnh đạo`, `Chuyên viên` |
| UI | `Giao diện ...` |
| Backend | `Document Service`, `User Service` |
| AI | `AI Service` |
| Database | `Database` |
| Action | Động từ + đối tượng: `Tải công văn`, `Lưu dữ liệu`, `Phân tích nội dung` |
| Condition | Câu hỏi: `Dữ liệu hợp lệ?`, `Đã hoàn thành?` |
| Class Name | Danh từ, PascalCase: `Document`, `Attachment`, `TaskAssignment`, `AIService` |
| Attribute | Danh từ, snake_case hoặc camelCase: `document_number`, `deadline`, `status` |
| Method | Động từ + danh từ: `add_attachment()`, `update_status()`, `is_overdue()` |
| Package | Tên cụm danh từ nghiệp vụ: `Quản lý Người dùng`, `Nghiệp vụ Công văn` |

---

# 11. Kết quả mong muốn

Mỗi biểu đồ được tạo theo skill này phải đạt 4 tiêu chí:

**Đúng nghiệp vụ → Dễ đọc → Nhìn đẹp → Dễ chỉnh sửa.**

Không ưu tiên việc nhồi tất cả chi tiết vào một hình. Khi biểu đồ quá lớn, hãy tách thành các use case/quy trình nhỏ hơn.
