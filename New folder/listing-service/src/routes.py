from fastapi import APIRouter, HTTPException
from .schemas import CreateListingRequest, ListingResponse, ReserveRequest, ReleaseRequest, MarkCollectedRequest
from .service import create_listing, get_listing, get_listings, reserve_listing, release_listing, mark_collected, expire_listing, cancel_listing

router = APIRouter()

@router.post("/listings", response_model=ListingResponse)
def create_listing_endpoint(request: CreateListingRequest):
    listing = create_listing(request)
    return listing

@router.get("/listings/{listing_id}", response_model=ListingResponse)
def get_listing_endpoint(listing_id: str):
    listing = get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.get("/listings", response_model=list[ListingResponse])
def get_listings_endpoint():
    return get_listings()

@router.patch("/listings/{listing_id}/reserve", response_model=ListingResponse)
def reserve_listing_endpoint(listing_id: str, request: ReserveRequest):
    listing = reserve_listing(listing_id, request)
    if not listing:
        raise HTTPException(status_code=400, detail="Cannot reserve")
    return listing

@router.patch("/listings/{listing_id}/release", response_model=ListingResponse)
def release_listing_endpoint(listing_id: str, request: ReleaseRequest):
    listing = release_listing(listing_id, request)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/listings/{listing_id}/mark-collected", response_model=ListingResponse)
def mark_collected_endpoint(listing_id: str, request: MarkCollectedRequest):
    listing = mark_collected(listing_id, request)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/listings/{listing_id}/expire", response_model=ListingResponse)
def expire_listing_endpoint(listing_id: str):
    listing = expire_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/listings/{listing_id}/cancel", response_model=ListingResponse)
def cancel_listing_endpoint(listing_id: str):
    listing = cancel_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing