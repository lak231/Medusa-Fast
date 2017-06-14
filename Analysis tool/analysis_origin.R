rm(list=ls())
cat("\014")
graphics.off()
library(ggplot2)
library(rjson)
setwd("C:/Users/quang/OneDrive/Researches/webcam-eyetracking/Analysis tool")


read_data  <- function(file){
  gaze_data <- read.csv2 (file,header = TRUE, sep = ",",stringsAsFactors=FALSE)
  info <- fromJSON(gaze_data$info..M.)
  elapsed_time <- as.numeric(unlist(info$elapsedTime$L))
  gaze_x <- as.numeric(unlist(info$gaze_x$L))
  gaze_y <- as.numeric(unlist(info$gaze_y$L))
  object_x <- as.numeric(unlist(info$object_x$L))
  object_y <- as.numeric(unlist(info$object_y$L))
  
  id = rep(gaze_data$gazer_id..S.,length(gaze_x))
  timestamp <- rep(gaze_data$time_collected..S.,length(gaze_x))
  url <- rep(info$url$S,length(gaze_x))
  description <- rep(info$description$S,length(gaze_x))
  task <- rep(info$task$S,length(gaze_x))
  
  gaze_df <- data.frame(id,timestamp, url, description, task, elapsed_time, gaze_x,gaze_y,object_x,object_y)
  names(gaze_df) <- c("id","time_stamp","url","description","task","elapsed_time","gaze_x","gaze_y","object_x","object_y")
  return (gaze_df)
}

gaze_data <- read_data("Gazers.csv")


###########################################
#
# TESTING PURPOSE. ADD SOME EXTRA VARIABLES THAT WILL BE COLLECTED LATER
#
###########################################
gaze_data$screen_width <- rep(1920,length(gaze_data$gaze_x))
gaze_data$screen_height <- rep(1080,length(gaze_data$gaze_x))
gaze_data$gaze_x_per <- gaze_data$gaze_x / gaze_data$screen_width
gaze_data$gaze_y_per <- gaze_data$gaze_y / gaze_data$screen_height
gaze_data$object_x_per <- gaze_data$object_x / gaze_data$screen_width
gaze_data$object_y_per <- gaze_data$object_y / gaze_data$screen_height

###########################################
#
# DATA CLEANING
#
###########################################

###########################################
#
# SUMMARY OF FAILURE TRIALS
#
###########################################

###########################################
#
# SUMMARY OF SUCCESS TRIALS
#
###########################################

###########################################
#
# SIMPLE ANALYSIS
#
###########################################
# average from gaze points to target positions. In pixels.
gaze_data$dist_pixel <- sqrt((gaze_data$object_x - gaze_data$gaze_x)^2 + (gaze_data$object_y - gaze_data$gaze_y)^2)
#number
summary(gaze_data$dist_pixel)

# average from gaze points to target positions. In percentage.
gaze_data$dist_per <- sqrt((gaze_data$object_x_per - gaze_data$gaze_x_per)^2 + (gaze_data$object_y_per - gaze_data$gaze_y_per)^2)
#number
summary(gaze_data)
#graph - heatmap
ggplot(gaze_data,aes(x=gaze_x_per,y=gaze_y_per)) +
  theme(strip.text.x = element_text(size = 16)) + 
  stat_density2d(aes(fill=..level.., alpha = ..level..), geom="polygon", bins = 5, size = 0.01) +
  scale_fill_gradient(low="green", high="red") +
  #geom_point(aes(col = condition)) +
  scale_x_continuous(limits = c(0, 1), breaks = c(0.2, 0.5, 0.8)) +
  scale_y_reverse( lim=c(1,0), breaks = c(0.2, 0.5, 0.8)) + 
  scale_alpha_continuous(range=c(0.1,0.8)) +
  geom_point(data = gaze_data, aes(x = object_x_per, y = object_y_per), shape = 3, size = 3) +
  guides(fill = FALSE, group = FALSE, colour=FALSE, alpha = FALSE) +
  labs("y" = "position of target in % of screen height", "x" = "position of target in % of screen width")


# distance overtime.
ggplot(gaze_data,aes(elapsed_time,dist_pixel)) + geom_point(shape  = 1) + geom_smooth()

# distance in percentage overtime
ggplot(gaze_data,aes(elapsed_time,dist_pixel_per)) + geom_point(shape  = 1) + geom_smooth()


# graph of distance overtime

###########################################
#
# PURSUIT ANALYSIS
#
###########################################

###########################################
#
# FREEVIEW ANALYSIS
#
###########################################