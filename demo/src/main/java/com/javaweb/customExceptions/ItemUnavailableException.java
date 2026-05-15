package com.javaweb.customExceptions;

public class ItemUnavailableException extends RuntimeException{
    public ItemUnavailableException(String message){
        super(message);
    }
}
