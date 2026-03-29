# kong-setup.ps1
# Only run this if kong.yml declarative config didn't work
# Run with: .\kong-setup.ps1

Write-Host "Waiting for Kong to be ready..."
Start-Sleep -Seconds 30

Write-Host "Registering services in Kong..."

# listing-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"listing-service","url":"http://listing-service:8000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/listing-service/routes" -ContentType "application/json" -Body '{"paths":["/listings"],"strip_path":false}'

# reservation-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"reservation-service","url":"http://reservation-service:8000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/reservation-service/routes" -ContentType "application/json" -Body '{"paths":["/reservations"],"strip_path":false}'

# strike-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"strike-service","url":"http://strike-service:8000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/strike-service/routes" -ContentType "application/json" -Body '{"paths":["/strikes"],"strip_path":false}'

# registration-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"registration-service","url":"http://registration-service:5000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/registration-service/routes" -ContentType "application/json" -Body '{"paths":["/registrations"],"strip_path":false}'

# reserve-composite-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"reserve-composite-service","url":"http://reserve-composite-service:8000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/reserve-composite-service/routes" -ContentType "application/json" -Body '{"paths":["/reserve"],"strip_path":false}'

# collection-service
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services" -ContentType "application/json" -Body '{"name":"collection-service","url":"http://collection-service:5000"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:9001/services/collection-service/routes" -ContentType "application/json" -Body '{"paths":["/collect"],"strip_path":false}'

Write-Host "Done! Verify at http://localhost:9001/services"
Write-Host "Test Kong proxy at http://localhost:9000/listings"