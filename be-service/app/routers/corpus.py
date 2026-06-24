from fastapi import APIRouter

from app.models.common import ApiResponse
from app.models.corpus import CorpusAnalysisRequest, CorpusAnalysisResponse
from app.controllers import corpus_controller

router = APIRouter(prefix="/corpus", tags=["corpus"])


@router.post("/analyze", response_model=ApiResponse[CorpusAnalysisResponse])
def analyze(payload: CorpusAnalysisRequest):
    data = corpus_controller.analyze(payload.category)
    return ApiResponse(
        success=True,
        message="Corpus analysis complete",
        data=data,
    )
