resource "aws_kinesis_video_stream" "main" {
  name                    = "${var.project_name}-${var.environment}-video"
  data_retention_in_hours = 1
}
