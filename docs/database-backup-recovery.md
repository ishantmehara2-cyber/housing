# Database Backup & Recovery Procedures

## Automated Daily Backups

### MySQL Dump Backup Script (`backup.sh`)
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mysql"
DB_NAME="housing_clone"

mkdir -p $BACKUP_DIR
mysqldump -u db_user -p'db_password' $DB_NAME | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Retain last 30 daily backups
find $BACKUP_DIR -type f -mtime +30 -name "*.sql.gz" -delete
```

---

## Restoration Procedure

```bash
# 1. Uncompress Backup
gunzip backup_20260218_120000.sql.gz

# 2. Restore Database
mysql -u db_user -p'db_password' housing_clone < backup_20260218_120000.sql

# 3. Verify Database Migration Status
npx prisma migrate status
```
