from fastapi import APIRouter
from app.api.v1.ai import router as ai_router
from app.api.v1.reader import router as reader_router
from app.api.v1.readings import router as readings_router
from app.api.v1.tariffs import router as tariffs_router
from app.api.v1.auth import router as auth_router
from app.api.v1.customer import router as customer_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(customer_router)
api_router.include_router(admin_router)
api_router.include_router(ai_router)
api_router.include_router(reader_router)
api_router.include_router(readings_router)
api_router.include_router(tariffs_router)

