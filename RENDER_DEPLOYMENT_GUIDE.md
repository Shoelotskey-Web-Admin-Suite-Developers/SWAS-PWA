# Render Deployment Guide for SWAS-PWA with Daily Analytics

## Overview
This guide explains how to deploy SWAS-PWA to Render with automated daily analytics that run at 1:00 AM Philippines time (5:00 PM UTC).

## Local vs Production Setup

### Your Current Local Setup:
```powershell
cd "c:\Users\Lagman\Desktop\Codes\SWAS PWA\SWAS-PWA\server\scripts"
.\.venv311\Scripts\Activate.ps1  # Activates Python virtual environment
python run_daily_analytics.py    # Runs the analytics pipeline
```

### Production Setup on Render:
- **No manual virtual environment activation needed** - Render handles this automatically
- **Dependencies installed from `requirements.txt`** - Contains exact packages from your `.venv311`
- **Automated scheduling** - Runs daily at 5:00 PM UTC without manual intervention
- **Cloud environment** - Access to your production database and resources

## Deployment Options

### Option 1: Using render.yaml (Recommended)
The `render.yaml` file in the root directory configures everything automatically:

1. **Web Service**: Your Node.js/Express server
2. **Cron Job**: Python analytics pipeline that runs daily at 5:00 PM UTC
3. **Static Site**: React client (optional)

### Option 2: Manual Setup via Render Dashboard

If you prefer manual setup through Render's dashboard:

#### Step 1: Deploy the Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `swas-pwa-server`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Choose appropriate plan (Starter for testing)

#### Step 2: Deploy the Cron Job
1. Click "New +" → "Cron Job"
2. Connect the same repository
3. Configure:
   - **Name**: `daily-analytics-cron`
   - **Environment**: `Python 3`
   - **Build Command**: `cd server && pip install -r requirements.txt`
   - **Command**: `cd server/scripts && python run_daily_analytics.py`
   - **Schedule**: `0 17 * * *` (5:00 PM UTC daily)
   - **Plan**: Choose appropriate plan

## Environment Variables

### Required Environment Variables
Set these in both your web service and cron job:

```bash
# Database
DATABASE_URL=mongodb://your-mongo-connection-string
MONGODB_URI=mongodb://your-mongo-connection-string

# Authentication (if needed)
JWT_SECRET=your-jwt-secret

# API Keys (if needed)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Python Environment
PYTHONPATH=/opt/render/project/src/server
```

## Timezone Considerations

**Important**: Render cron jobs run in UTC timezone. Current schedule is `0 17 * * *` (5:00 PM UTC) which runs at **1:00 AM Philippines time**.

**Timezone Conversion Examples:**
- **Current Setting**: `0 17 * * *` = 5:00 PM UTC = **1:00 AM Philippines (UTC+8) same calendar day**
- **Other examples**:
  - **1:00 AM PST (UTC-8)**: `0 9 * * *` (9:00 AM UTC same day)  
  - **1:00 AM EST (UTC-5)**: `0 6 * * *` (6:00 AM UTC same day)

Update the schedule in `render.yaml` if you need a different time.

## Monitoring and Logs

### Viewing Logs
1. Go to your Render dashboard
2. Click on the cron job service
3. Navigate to "Logs" tab to see execution history

### Manual Execution

**Locally (your current setup):**
```powershell
cd "c:\Users\Lagman\Desktop\Codes\SWAS PWA\SWAS-PWA\server\scripts"
.\.venv311\Scripts\Activate.ps1
python run_daily_analytics.py
```

**On Render (after deployment):**
- Use the Render dashboard to manually trigger the cron job
- Or add an endpoint to your Express server for manual triggering:
```bash
POST /api/admin/run-analytics
```

### Health Checks
The analytics script provides detailed logging:
- ✅ Success indicators
- ❌ Error messages with details
- 📊 Execution summary
- ⏱️ Duration tracking

## File Structure After Deployment

```
/opt/render/project/src/
├── render.yaml
├── server/
│   ├── requirements.txt          # Python dependencies
│   ├── package.json             # Node.js dependencies
│   ├── scripts/
│   │   ├── run_daily_analytics.py    # Main analytics script
│   │   ├── calc_daily_revenue.py
│   │   ├── sales_over_time.py
│   │   ├── monthly_growth.py
│   │   ├── forecast.py
│   │   └── clean_transaction_revenue.py
│   └── src/                     # Server source code
└── client/                      # React client
```

## Troubleshooting

### Common Issues

1. **Python Dependencies Not Found**
   - Ensure `requirements.txt` is in the `server/` directory
   - Check that build command includes `pip install -r requirements.txt`

2. **Database Connection Issues**
   - Verify `DATABASE_URL` environment variable is set correctly
   - Ensure database allows connections from Render's IP ranges

3. **File Path Issues**
   - Use relative paths in Python scripts
   - Ensure `PYTHONPATH` is set correctly

4. **Timezone Confusion**
   - Remember that cron jobs run in UTC
   - Adjust schedule accordingly for your local timezone

### Debugging Steps

1. **Check Cron Job Logs**:
   ```bash
   # In Render dashboard, go to Cron Job → Logs
   ```

2. **Test Analytics Locally**:
   ```powershell
   # Your current local setup:
   cd "c:\Users\Lagman\Desktop\Codes\SWAS PWA\SWAS-PWA\server\scripts"
   .\.venv311\Scripts\Activate.ps1
   python run_daily_analytics.py
   
   # Or use npm script:
   cd server
   npm run analytics:test
   ```

3. **Manual Database Check**:
   - Verify database collections are being updated
   - Check output files in the `scripts/output/` directory

## Deployment Checklist

- [ ] `render.yaml` configured with correct services
- [ ] `requirements.txt` contains all Python dependencies
- [ ] Environment variables set in Render dashboard
- [ ] Database connection string configured
- [ ] Cron schedule set to desired timezone
- [ ] Repository connected to Render
- [ ] Initial deployment successful
- [ ] Cron job appears in Render dashboard
- [ ] Test manual analytics execution
- [ ] Verify first automated run at 5:00 PM UTC

## Cost Considerations

### Render Pricing (as of 2024):
- **Cron Jobs**: $1/month for Starter plan (512MB RAM, 0.1 CPU)
- **Web Services**: $7/month for Starter plan (512MB RAM, 0.1 CPU)
- **Database**: Consider using MongoDB Atlas free tier or Render PostgreSQL

### Optimization Tips:
- Use Starter plan for analytics cron job (sufficient for data processing)
- Consider combining multiple analytics tasks into single cron job
- Monitor resource usage and upgrade if needed

## Support

If you encounter issues:
1. Check Render's status page
2. Review deployment logs
3. Test scripts locally first
4. Contact Render support for platform-specific issues