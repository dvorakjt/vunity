package com.example.videochat3.controllers;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class LiveMeeting {
    String meetingId;
    boolean isOpen = false;
    List<Participant> participants = new CopyOnWriteArrayList<>();
    Map<String, Participant> participantsById = new HashMap<String, Participant>();
    String activeScreenSharerId = null;

    public LiveMeeting(String meetingId) {
        this.meetingId = meetingId;
    }
}
