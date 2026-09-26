import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models import Department, User, Document, TaskAssignment, DraftResponse

# Cấu hình SQLite in-memory test database với StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Dữ liệu khởi tạo cho test
    dept = Department(id=1, code="VPCQ", name="Văn phòng Cơ quan")
    session.add(dept)
    session.commit()

    hashed_pw = get_password_hash("123456")
    user_clerk = User(
        id=1, username="vanthu", password_hash=hashed_pw,
        full_name="Nguyễn Thị Mai", email="vanthu@coquan.gov.vn",
        role="CLERK", department_id=1, is_active=True
    )
    user_leader = User(
        id=2, username="lanhdao", password_hash=hashed_pw,
        full_name="Trần Văn Hùng", email="lanhdao@coquan.gov.vn",
        role="LEADER", department_id=1, is_active=True
    )
    user_specialist = User(
        id=3, username="chuyenvien", password_hash=hashed_pw,
        full_name="Lê Hoàng Nam", email="chuyenvien@coquan.gov.vn",
        role="SPECIALIST", department_id=1, is_active=True
    )
    session.add_all([user_clerk, user_leader, user_specialist])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def clerk_headers():
    token = create_access_token(subject=1, role="CLERK")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def leader_headers():
    token = create_access_token(subject=2, role="LEADER")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def specialist_headers():
    token = create_access_token(subject=3, role="SPECIALIST")
    return {"Authorization": f"Bearer {token}"}
