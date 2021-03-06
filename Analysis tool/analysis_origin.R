rm(list=ls())
cat("\014")
graphics.off()
library(ggplot2)
library(jsonlite)
library(saccades)
setwd("C:/Users/quang/OneDrive/Researches/webcam-eyetracking/Analysis tool")
gaze_data <- fromJSON("getCSV/data.json")
# get all calibration position
calibration_positions <- data.frame()
# get all validation positions
validation_positions <- data.frame()
# get all simple positions
simple_positions <- data.frame()
# get all simple positions
pursuit_positions <- data.frame()
gaze_df  = data.frame()
for (i in 1:length(gaze_data)){
  #validation_positions <-unique(rbind(validation_positions,gaze_data[[i]]$info$validation_position_array))
  #simple_positions <-unique(rbind(simple_positions,gaze_data[[i]]$info$simple_position_array))
  #calibration_positions <-unique(rbind(calibration_positions,gaze_data[[i]]$info$caliration_position_array))
  #pursuit_positions <-unique(rbind(pursuit_positions,gaze_data[[i]]$info$pursuit_position_array))
  info <- gaze_data[[i]]$info
  gaze_x <- info$gaze_x
  gaze_y <- info$gaze_y
  object_x <- info$object_x
  object_y <- info$object_y
  column_length <- length(gaze_x)
  id <- rep(gaze_data[[i]]$gazer_id,column_length)
  time_collected <- rep(gaze_data[[i]]$time_collected,column_length)
  url <- rep(info$url,column_length)
  description <- rep(info$description,column_length)
  task <- rep (info$task, column_length, column_length)
  screen_width <- rep(info$canvasWidth, column_length)
  screen_height <- rep(info$canvasHeight, column_length)
  elapsed_time <- info$elapsedTime
  gaze.temp <- data.frame(id,time_collected, url, description, task, elapsed_time, screen_width, screen_height,gaze_x,gaze_y,object_x,object_y)
  gaze_df <- rbind(gaze_df,gaze.temp)
}
names(gaze_df) <- c("id","time_collected","url","description","task","elapsed_time","screen_width","screen_height","gaze_x","gaze_y","object_x","object_y")
names(validation_positions) <- c("x","y")
names(calibration_positions) <- c("x","y")
names(simple_positions) <- c("x","y")
names(pursuit_positions) <- c("x","y")

###########################################
#
# DATA CLEANING
#
###########################################
gaze_df$gaze_x_per <- gaze_df$gaze_x / gaze_df$screen_width
gaze_df$gaze_y_per <- gaze_df$gaze_y / gaze_df$screen_height
gaze_df$object_x_per <- gaze_df$object_x / gaze_df$screen_width
gaze_df$object_y_per <- gaze_df$object_y / gaze_df$screen_height
gaze_df$dist_pixel <- sqrt((gaze_df$object_x - gaze_df$gaze_x)^2 + (gaze_df$object_y - gaze_df$gaze_y)^2)
gaze_df$dist_per <- sqrt((gaze_df$object_x_per - gaze_df$gaze_x_per)^2 + (gaze_df$object_y_per - gaze_df$gaze_y_per)^2)

###########################################
#
# SIMPLE ANALYSIS
#
###########################################

# average from gaze points to target positions. In pixels.

gaze_df_simple <- gaze_df[gaze_df$task == "simple",c("elapsed_time","gaze_x","gaze_y")]

summary(gaze_df_simple$dist_pixel)
ggplot(gaze_df_simple,aes(dist_pixel)) + geom_histogram()

#get fixation.
gaze_df_simple$trial = 1
names(gaze_df_simple) <- c("time","x","y","trial")
gaze_df_simple$time <- gaze_df_simple$time - rep(gaze_df_simple$time[1],length(gaze_df_simple$time))
gaze_df_simple <- gaze_df_simple[gaze_df_simple$time > 0,]
gaze_df_simple <- gaze_df_simple[1:1000,]
fixations <- detect.fixations(gaze_df_simple)
diagnostic.plot(gaze_df_simple,fixations)
calculate.summary(fixations)
# average from gaze points to target positions. In percentage.
#number
summary(gaze_df_simple$dist_per)
ggplot(gaze_df_simple,aes(dist_per)) + geom_histogram()


#graph - heatmap
ggplot(gaze_df_simple,aes(x=gaze_x_per,y=gaze_y_per)) +
  theme(strip.text.x = element_text(size = 16)) +
  stat_density2d(aes(fill=..level.., alpha = ..level..), geom="polygon", bins = 5, size = 0.01) +
  scale_fill_gradient(low="green", high="red") +
  #geom_point(aes(col = condition)) +
  scale_x_continuous(limits = c(0, 1), breaks = c(0.2, 0.5, 0.8)) +
  scale_y_reverse( lim=c(1,0), breaks = c(0.2, 0.5, 0.8)) +
  scale_alpha_continuous(range=c(0.1,0.8)) +
  geom_point(data = calibration_positions, aes(x = x, y = y), shape = 3, size = 3) +
  guides(fill = FALSE, group = FALSE, colour=FALSE, alpha = FALSE) +
  labs("y" = "position of target in % of screen height", "x" = "position of target in % of screen width")


# distance overtime.
ggplot(gaze_df_simple,aes(elapsed_time,dist_pixel)) + geom_point(shape  = 1) + geom_smooth()

# distance in percentage overtime
ggplot(gaze_df_simple,aes(elapsed_time,dist_per)) + geom_point(shape  = 1) + geom_smooth()

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
