library(saccades)
rm(list = ls())
gaze_df_simple$trial = 1
names(gaze_df_simple) <- c("time","x","y","trial")
gaze_df_simple$time <- gaze_df_simple$time - rep(gaze_df_simple$time[1],length(gaze_df_simple$time))
fixations <- detect.fixations(gaze_df_simple)
diagnostic.plot(gaze_df_simple,fixations)
